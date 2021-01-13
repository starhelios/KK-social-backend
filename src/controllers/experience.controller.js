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
  // console.log(req.query);
  const result = await experienceService.getAll(req.query);

  res.status(httpStatus.OK).send(generateResponse(true, result));
});

const filterExperience = catchAsync(async (req, res) => {
  const { categoryName, startDay, endDay, minPrice, maxPrice } = req.body;
  console.log(req.body);

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

const addDateAvaibility = catchAsync(async (req, res) => {
  const experience = await experienceService.getExperienceById(req.params.id);
  if (!experience) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }

  req.body.items.forEach((item) => experience.dateAvaibility.push(item));
  experience.save();

  res.send(generateResponse(true, { experience }));
});

const removeDateAvaibility = catchAsync(async (req, res) => {
  const experience = await experienceService.getExperienceById(req.params.id);
  if (!experience) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }
  req.body.ids.forEach((item) => experience.dateAvaibility.id(item).remove());
  experience.save();

  res.send(generateResponse(true, { experience }));
});

module.exports = {
  createExperience,
  getAll,
  filterExperience,
  getExperience,
  addDateAvaibility,
  removeDateAvaibility,
};
