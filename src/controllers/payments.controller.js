const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');
const { generateResponse } = require('../utils/utils');

const generateAccountLink = catchAsync(async (req, res) => {
  const userID = req.user._id;
  const stripeAccountLink = await paymentService.generateStripeConnectAccountLink(userID);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, stripeAccountLink));
});

const chargeCustomer = catchAsync(async (req, res) => {
  const userID = req.user._id;
  const chargeCustomerForExperience = await paymentService.chargeCustomerForExperience(req.body, userID);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, chargeCustomerForExperience));
});

const savePaymentMethod = catchAsync(async (req, res) => {
  const userID = req.user._id;
  const savePaymentMethodForCustomer = await paymentService.createCustomerForPlatformAccount(req.body, userID);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, savePaymentMethodForCustomer));
});

const savePaymentTransactionInDB = catchAsync(async (req, res) => {
  const userID = req.user._id;
  const saveTransactionInDB = await paymentService.saveTransactionInDB(req.body, userID);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, saveTransactionInDB));
});

const deletePaymentMethod = catchAsync(async (req, res) => {
  const userID = req.user._id;
  const deletePaymentMethodRes = await paymentService.deleteCustomerPaymentMethod(req.body, userID);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, deletePaymentMethodRes));
});

module.exports = {
  generateAccountLink,
  chargeCustomer,
  savePaymentMethod,
  savePaymentTransactionInDB,
  deletePaymentMethod,
};
