const httpStatus = require('http-status');
const moment = require('moment');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
// const { expression } = require('@hapi/joi');
const catchAsync = require('../utils/catchAsync');
const { experienceService, userService } = require('../services');
const { generateResponse } = require('../utils/utils');
const { Experience } = require('../models');
const ApiError = require('../utils/ApiError');

const createExperience = catchAsync(async (req, res) => {
  const catetories = await experienceService.createExperience(req.body);

  res.status(httpStatus.CREATED).send(generateResponse(true, catetories));
});

const getAll = catchAsync(async (req, res) => {
  const result = await experienceService.getAll(req.query);

  res.status(httpStatus.OK).send(generateResponse(true, result));
});

const reserveExperience = catchAsync(async (req, res) => {
  const result = await experienceService.reserveExperience(req.body);

  res.status(httpStatus.OK).send(generateResponse(true, result));
});

const filterExperience = catchAsync(async (req, res) => {
  const { categoryName, startDay, endDay, minPrice, maxPrice } = req.body;

  const query = {};

  if (categoryName.length > 0) {
    query.categoryName = { $in: categoryName };
  }

  if (startDay && endDay) {
    query.startDay = { $gte: startDay };
    // query.endDay = { $lte: endDay };
  }
  if (minPrice && maxPrice) {
    query.price = { $gte: minPrice, $lte: maxPrice };
  }

  const catetories = await Experience.find(query).exec();

  const result = catetories.filter((item) => {
    const today = new Date();
    const eDay = new Date(item.endDay);

    return eDay >= today;
  });

  res.status(httpStatus.OK).send(generateResponse(true, result));
});

const getExperience = catchAsync(async (req, res) => {
  const experience = await experienceService.getExperienceById(req.params.id);
  console.log(experience);
  if (!experience) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }

  const user = await userService.getUserById(experience.userId);

  if (user) {
    res.send(generateResponse(true, { experience }));
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }
});

const getUserBookings = catchAsync(async (req, res) => {
  const userBookings = await experienceService.getUserBookings(req.params.id);
  if (!req.params.id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User ID not found');
  } else if (!userBookings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User bookings not found');
  } else {
    res.send(generateResponse(true, { userBookings }));
  }
});

const addSpecificExperience = catchAsync(async (req, res) => {
  const experience = await experienceService.getExperienceById(req.params.id);
  if (!experience) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }

  req.body.items.forEach((item) => experience.specificExperience.push(item));
  experience.save();

  res.send(generateResponse(true, { experience }));
});

const createSpecificExperience = catchAsync(async (req, res) => {
  const experiencesCreated = await experienceService.createSpecificExperience(req.body);
  if (!experiencesCreated) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No experiences created');
  }
  res.send(generateResponse(true, { experiencesCreated }));
});

const removeDateAvaibility = catchAsync(async (req, res) => {
  const experience = await experienceService.getExperienceById(req.params.id);
  console.log(req.params.id);
  if (!experience) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }
  req.body.ids.forEach((item) => experience.dateAvaibility.id(item).remove());
  experience.save();

  res.send(generateResponse(true, { experience }));
});

module.exports = {
  createExperience,
  createSpecificExperience,
  getUserBookings,
  getAll,
  filterExperience,
  getExperience,
  addSpecificExperience,
  removeDateAvaibility,
  reserveExperience,
};
