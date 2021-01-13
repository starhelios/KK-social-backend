const httpStatus = require('http-status');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tutorialService } = require('../services');
const { generateResponse } = require('../utils/utils');
const Category = require('../models/category.model');

const createTutorial = catchAsync(async (req, res) => {
  await tutorialService.createTutorial(req.body);
  const tutorials = await tutorialService.getAll();

  res.status(httpStatus.CREATED).send(generateResponse(true, tutorials));
});

const getTutorials = catchAsync(async (req, res) => {
  const tutorials = await tutorialService.getAll();

  res.status(httpStatus.CREATED).send(generateResponse(true, tutorials));
});

const removeTutorial = catchAsync(async (req, res) => {
  await tutorialService.deleteTutorialById(req.params.id);
  const tutorials = await tutorialService.getAll();

  res.status(httpStatus.CREATED).send(generateResponse(true, tutorials));
});

module.exports = {
  createTutorial,
  getTutorials,
  removeTutorial,
};
