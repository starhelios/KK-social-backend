require('dotenv').config();
const httpStatus = require('http-status');
const colors = require('colors');

const { User, Transaction, Experience } = require('../models');
const { sendPurchaseConfirmationEmail } = require('./email.service');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const deleteCustomerPaymentMethod = async (data, userID) => {
  try {
    const user = await User.findById({ _id: userID });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
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
const deletePayment = async (pmId, userId) => {
  const paymentMethod = await stripe.paymentMethods.detach(pmId);
  console.log(paymentMethod);
  if (!paymentMethod.id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }
  const updatedUser = await User.findByIdAndUpdate(
    { _id: userId },
    { $pull: { availableMethods: { id: pmId } } },
    { new: true, upsert: true, multi: true }
  );
  if (updatedUser) {
    return 'Payment method deleted';
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
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
    console.log('creating stripe connect account');
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
      const stripeConnectAccountID = await createStripeConnectAccount(user._id);
      user.stripeConnectID = stripeConnectAccountID;
      await user.save();
      const accountLinks = await stripe.accountLinks.create({
        account: `${user.stripeConnectID}`,
        refresh_url: `${process.env.FRONTENT_ENDPOINT}/profile?type=refresh_url`,
        return_url: `${process.env.FRONTENT_ENDPOINT}` + `profile?type=success`,
        type: 'account_onboarding',
      });
      return accountLinks.url;
    } else {
      const accountLinks = await stripe.accountLinks.create({
        account: `${user.stripeConnectID}`,
        refresh_url: `${process.env.FRONTENT_ENDPOINT}/profile?type=refresh_url`,
        return_url: `${process.env.FRONTENT_ENDPOINT}` + `profile?type=success`,
        type: 'account_onboarding',
      });
      return accountLinks.url;
    }
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while generating account URL.');
  }
};

const chargeCustomerForExperience = async (data, userID) => {
  console.log(data);
  try {
    const user = await User.findOne({ _id: userID });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    console.log('data is here...', userID);
    const findExperience = await Experience.findOne({ _id: data.experienceID });
    if (!findExperience) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
    }
    console.log(colors.green(findExperience.userId));
    const findHostUser = await User.findOne({ _id: findExperience.userId });
    if (!findHostUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    console.log('this is the data', data);
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
        // payment_method: findHostUser.stripeCustomerID,
        application_fee_amount: data.amount * process.env.APP_FEE,
        transfer_data: {
          destination: `${findHostUser.stripeConnectID}`,
        },
      });
      console.log(paymentIntent);
      return paymentIntent.client_secret;
    }
  } catch (err) {
    //pushing local changes to override current branch
    console.log(err.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment method failed.');
  }
};

//Get all payments from stripe and save in DB
const saveTransactionInDB = async (data, userID) => {
  try {
    const getPaymentIntent = await await stripe.paymentIntents.retrieve(`${data.id}`);
    const newTransaction = new Transaction();
    newTransaction.stripeRawData = getPaymentIntent;
    newTransaction.total_amount_charged = getPaymentIntent.amount_received;
    newTransaction.application_fee_amount = getPaymentIntent.application_fee_amount;
    newTransaction.stripeCustomerID = getPaymentIntent.customer;
    newTransaction.stripeConnectID = getPaymentIntent.transfer_data.destination;
    newTransaction.stripePaymentIntentID = getPaymentIntent.id;
    newTransaction.viewChargesURL = getPaymentIntent.charges.url;
    newTransaction.experienceID = `${data.experienceID}`;

    console.log(getPaymentIntent);
    console.log('-------');

    const findHostUser = await User.findOne({
      stripeConnectID: getPaymentIntent.transfer_data.destination,
    });

    if (!findHostUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Host not found.');
    }

    const findPurchaseUser = await User.findOne({
      _id: userID,
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
    newTransaction.purchaseUserID = `${userID}`;
    await newTransaction.save();
    sendPurchaseConfirmationEmail(findPurchaseUser.email, findExperience.title, findHostUser.fullname);
    return 'OK';
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while getting payment.');
  }
};

const createCustomerForPlatformAccount = async (data, userID) => {
  try {
    const user = await User.findOne({ _id: userID });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    let splitMonthAndYear = data.data.cardExpiryDate;
    splitMonthAndYear = splitMonthAndYear.split(' ');
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

    // create stripe customer object if it doesn't exist in database
    if (!user.stripeCustomerID) {
      isItFirstPaymentMethod = true;
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullname,
        payment_method: paymentMethod.id,
      });
      user.stripeCustomerID = customer.id;
    }
    if (!isItFirstPaymentMethod) {
      /**
       * Attach payment method id to customer
       */
      const paymentMethodAttach = await stripe.paymentMethods.attach(`${paymentMethod.id}`, {
        customer: `${user.stripeCustomerID}`,
      });
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
  deletePayment,
};
