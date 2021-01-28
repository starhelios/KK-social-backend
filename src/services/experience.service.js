const httpStatus = require('http-status');
const moment = require('moment');
const { Experience, User } = require('../models');
const ApiError = require('../utils/ApiError');

const getExperienceByName = async (name) => {
  return Experience.findOne({ name });
};

const createExperience = async (experienceBody) => {
  if (await Experience.isTitleTaken(experienceBody.title)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Experience name already taken');
  }
  const category = await Experience.create(experienceBody);

  return category;
};

const reserveExperience = async ({ userId, experienceId }) => {
  const result = await Experience.findOne({ _id: experienceId });
  if (result.usersGoing.indexOf(userId) > -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User is already going');
  } else {
    result.usersGoing.push(userId);
    await result.save();
  }
  return result;
};

const getAll = async (query) => {
  const experiences = await Experience.find(query);
  const result = experiences.filter((item) => {
    const today = new Date();
    const endDay = new Date(item.endDay);

    return endDay >= today;
  });

  return result;
};

const getExperienceById = async (id) => {
  const findExperience = await Experience.findOne({ _id: id });

  if (!findExperience) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }
  const findHostInfo = await User.findOne({
    _id: findExperience.userId,
  });

  if (!findHostInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'USER not found');
  }
  const {
    _id,
    images,
    title,
    description,
    duration,
    price,
    categoryName,
    dateAvaibility,
    startDay,
    endDay,
    userId,
    createAt,
    updatedAt,
  } = findExperience;
  const responseData = {
    id: _id,
    _id,
    images,
    title,
    description,
    duration,
    price,
    categoryName,
    dateAvaibility,
    startDay,
    endDay,
    userId,
    createAt,
    updatedAt,
    hostData: {
      fullname: findHostInfo.fullname,
      email: findHostInfo.email,
    },
  };
  return responseData;
};

const getAllUserExperiences = async (id) => {
  // const experiences = Experience.find({})
};

const updateExperienceById = async (categoryId, updateBody) => {
  const category = await getExperienceById(categoryId);

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }

  if (updateBody.name && (await Experience.isNameTaken(updateBody.name, categoryId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Experience name already taken');
  }
  Object.assign(category, updateBody);

  await category.save();
  return category;
};

const deleteExperienceById = async (categoryId) => {
  const category = await getExperienceById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }
  await category.remove();
  return category;
};

module.exports = {
  getExperienceByName,
  createExperience,
  reserveExperience,
  getAll,
  getExperienceById,
  updateExperienceById,
  deleteExperienceById,
};
