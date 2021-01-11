require('dotenv').config();
const httpStatus = require('http-status');

const { User, Transaction, Experience } = require('../models');
const { sendPurchaseConfirmationEmail } = require('./email.service');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const deleteCustomerPaymentMethod = async (data) => {
  try {
    const user = await User.findById({ _id: data.userID });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    console.log(data);
    const userAvailableMethods = user.availableMethods;
    let filteredAvailableMethods = [];
    for (let i = 0; i < userAvailableMethods.length; i++) {
      let currentElem = userAvailableMethods[i];
      if (currentElem.id !== data.payment_method_id) {
        filteredAvailableMethods.push(currentElem);
      }
    }
    user.availableMethods = filteredAvailableMethods;
    await user.save();
    return `OK. deleted payment method.`;
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while finishing up setup.');
  }
};
const createStripeConnectAccount = async (userId) => {
  try {
    const user = await User.findById({ _id: userId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
    });
    console.log(account);
    return `${account.id}`;
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while finishing up setup.');
  }
};

const generateStripeConnectAccountLink = async (userId) => {
  try {
    const user = await User.findById({ _id: userId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (!user.stripeConnectID) {
      console.log("stripe connect account doesn't exist");
      const stripeConnectAccountID = await createStripeConnectAccount(user._id);
      user.stripeConnectID = stripeConnectAccountID;
      await user.save();
      const accountLinks = await stripe.accountLinks.create({
        account: `${user.stripeConnectID}`,
        refresh_url: `${process.env.FRONT_END_APP_URL}/profile?type=refresh_url`,
        return_url: `${process.env.FRONT_END_APP_URL}/profile?type=success`,
        type: 'account_onboarding',
      });
      console.log('accounts link');
      console.log(accountLinks);
      return accountLinks.url;
    } else {
      console.log('stripe connect account does exist');
      const accountLinks = await stripe.accountLinks.create({
        account: `${user.stripeConnectID}`,
        refresh_url: `${process.env.FRONT_END_APP_URL}/profile?type=refresh_url`,
        return_url: `${process.env.FRONT_END_APP_URL}/profile?type=success`,
        type: 'account_onboarding',
      });
      console.log('accounts link');
      console.log(accountLinks);
      return accountLinks.url;
    }
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while generating account URL.');
  }
};

const chargeCustomerForExperience = async (data) => {
  try {
    console.log(data);
    // user = authenticated user trying to register
    const user = await User.findById({ _id: data.userID });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    const findExperience = await Experience.findById({ _id: data.experienceID });
    if (!findExperience) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
    }
    const findHostUser = await User.findById({ _id: findExperience.userId });
    if (!findHostUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    console.log(user.stripeConnectID);
    if (data.payment_type === 'saved') {
      const paymentIntent = await stripe.paymentIntents.create({
        payment_method_types: ['card'],
        amount: data.amount,
        payment_method: data.payment_method_id,
        customer: user.stripeCustomerID,
        currency: 'usd',
        application_fee_amount: data.amount * process.env.APP_FEE,
        transfer_data: {
          destination: `${findHostUser.stripeConnectID}`,
        },
      });

      console.log(paymentIntent);
      return paymentIntent.client_secret;
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        payment_method_types: ['card'],
        amount: data.amount,
        currency: 'usd',
        application_fee_amount: data.amount * process.env.APP_FEE,
        transfer_data: {
          destination: `${findHostUser.stripeConnectID}`,
        },
      });

      console.log(paymentIntent);
      return paymentIntent.client_secret;
    }
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while generating Intent.');
  }
};

//Get all payments from stripe and save in DB
const saveTransactionInDB = async (data) => {
  try {
    console.log(data);
    const getPaymentIntent = await await stripe.paymentIntents.retrieve(`${data.id}`);
    console.log(getPaymentIntent);
    const newTransaction = new Transaction();
    newTransaction.stripeRawData = getPaymentIntent;
    newTransaction.total_amount_charged = getPaymentIntent.amount_received;
    newTransaction.application_fee_amount = getPaymentIntent.application_fee_amount;
    newTransaction.stripeCustomerID = getPaymentIntent.customer;
    newTransaction.stripeConnectID = getPaymentIntent.transfer_data.destination;
    newTransaction.stripePaymentIntentID = getPaymentIntent.id;
    newTransaction.viewChargesURL = getPaymentIntent.charges.url;
    newTransaction.experienceID = `${data.experienceID}`;

    const findHostUser = await User.findOne({
      stripeConnectID: getPaymentIntent.transfer_data.destination,
    });

    if (!findHostUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Host not found.');
    }

    const findPurchaseUser = await User.findOne({
      _id: data.userID,
    });
    if (!findPurchaseUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Purchase User not found.');
    }

    const findExperience = await Experience.findOne({
      _id: data.experienceID,
    });
    if (!findExperience) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Experience not found.');
    }

    newTransaction.hostUserID = findHostUser._id;
    newTransaction.purchaseUserID = `${data.userID}`;
    await newTransaction.save();
    sendPurchaseConfirmationEmail(findPurchaseUser.email, findExperience.title, findHostUser.fullname);
    return 'OK';
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while getting payment.');
  }
};

const createCustomerForPlatformAccount = async (data) => {
  try {
    const user = await User.findById({ _id: data.userID });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    console.log(data);
    let splitMonthAndYear = data.data.cardExpiryDate;
    splitMonthAndYear = splitMonthAndYear.split(' ');
    console.log(splitMonthAndYear);
    const expiryDate = parseInt(splitMonthAndYear[0]);
    const expiryYear = parseInt(splitMonthAndYear[1]);
    let isItFirstPaymentMethod = false;
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: `${data.data.cardNumber}`,
        exp_month: expiryDate,
        exp_year: expiryYear,
        cvc: `${data.data.cardCVV}`,
      },
    });

    console.log(paymentMethod);

    // create stripe customer object if it doesn't exist in database
    if (!user.stripeCustomerID) {
      isItFirstPaymentMethod = true;
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullname,
        payment_method: paymentMethod.id,
      });
      user.stripeCustomerID = customer.id;

      console.log(customer);
    }
    if (!isItFirstPaymentMethod) {
      /**
       * Attach payment method id to customer
       */
      const paymentMethodAttach = await stripe.paymentMethods.attach(`${paymentMethod.id}`, {
        customer: `${user.stripeCustomerID}`,
      });
      console.log(paymentMethodAttach);
    }
    //save payment method ids in db.
    const currentUserPaymentMethods = user.availableMethods;
    const paymentMethodObjectForDatabase = {
      id: paymentMethod.id,
      cardBrand: paymentMethod.card.brand,
      expiryMonth: paymentMethod.card.exp_month,
      expiryYear: paymentMethod.card.exp_year,
      last4digits: paymentMethod.card.last4,
    };

    currentUserPaymentMethods.push(paymentMethodObjectForDatabase);
    user.availableMethods = currentUserPaymentMethods;
    await user.save();

    // response - "ok"
    return 'OK';
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while generating account URL.');
  }
};

module.exports = {
  createStripeConnectAccount,
  chargeCustomerForExperience,
  generateStripeConnectAccountLink,
  createCustomerForPlatformAccount,
  saveTransactionInDB,
  deleteCustomerPaymentMethod,
};
