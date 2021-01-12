const httpStatus = require('http-status');
const { Tutorial } = require('../models');
const ApiError = require('../utils/ApiError');

const createTutorial = async (body) => {
  const tutorial = await Tutorial.create(body);

  return tutorial;
};

const getAll = async () => {
  const tutorials = await Tutorial.find({});

  return tutorials;
};

const deleteTutorialById = async (id) => {
  const tutorial = await Tutorial.findById(id);
  if (!tutorial) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tutorial not found');
  }
  await tutorial.remove();
  return tutorial;
};

module.exports = {
  createTutorial,
  getAll,
  deleteTutorialById,
};
