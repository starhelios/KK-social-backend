const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { paymentService } = require('../services');
const { generateResponse } = require('../utils/utils');

const generateAccountLink = catchAsync(async (req, res) => {
  console.log(req.params.userId);
  const stripeAccountLink = await paymentService.generateStripeConnectAccountLink(req.params.userId, 'test2');

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, stripeAccountLink));
});

const chargeCustomer = catchAsync(async (req, res) => {
  console.log(req.params.userId);
  const chargeCustomerForExperience = await paymentService.chargeCustomerForExperience(req.body);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, chargeCustomerForExperience));
});

const savePaymentMethod = catchAsync(async (req, res) => {
  const savePaymentMethodForCustomer = await paymentService.createCustomerForPlatformAccount(req.body);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, savePaymentMethodForCustomer));
});

const savePaymentTransactionInDB = catchAsync(async (req, res) => {
  const saveTransactionInDB = await paymentService.saveTransactionInDB(req.body);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, saveTransactionInDB));
});

const deletePaymentMethod = catchAsync(async (req, res) => {
  const deletePaymentMethodRes = await paymentService.deleteCustomerPaymentMethod(req.body);

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
