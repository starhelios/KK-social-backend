require('dotenv').config();
const httpStatus = require('http-status');

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(process.env.STRIPE_DEV_KARMA_KloutKastDemo_SECRET_KEY);

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
    const accountLinks = await stripe.accountLinks.create({
      account: `${user.stripeConnectID}`,
      refresh_url: `${FRONT_END_APP_URL}/profile?type=success`,
      return_url: `${FRONT_END_APP_URL}/profile?type=failure`,
      type: 'account_onboarding',
    });

    return accountLinks.url;
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while generating account URL.');
  }
};

const chargeCustomerForExperience = async (data) => {
  console.log(data);
  const user = await User.findById({ _id: data.userID });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  console.log(user.stripeConnectID);
  const paymentIntent = await stripe.paymentIntents.create({
    payment_method_types: ['card'],
    amount: data.amount,
    currency: 'usd',
    application_fee_amount: data.amount * process.env.APP_FEE,
    transfer_data: {
      destination: `${user.stripeConnectID}`,
    },
  });
  console.log(paymentIntent);
  return paymentIntent;
};

module.exports = {
  createStripeConnectAccount,
  chargeCustomerForExperience,
  generateStripeConnectAccountLink,
};
