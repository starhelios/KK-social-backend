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
  res.send(generateResponse(true, stripeAccountLink.url));
});

const chargeCustomer = catchAsync(async (req, res) => {
  console.log(req.params.userId);
  const chargeCustomerForExperience = await paymentService.chargeCustomerForExperience(req.body);

  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  res.send(generateResponse(true, chargeCustomerForExperience));
});

module.exports = {
  generateAccountLink,
  chargeCustomer,
};
