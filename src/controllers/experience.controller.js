const httpStatus = require('http-status');
const moment = require('moment');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
// const { expression } = require('@hapi/joi');
const catchAsync = require('../utils/catchAsync');
const { experienceService, userService } = require('../services');
const { generateResponse } = require('../utils/utils');
const { Experience, User } = require('../models');
const ApiError = require('../utils/ApiError');

const createExperience = catchAsync(async (req, res) => {
  const categories = await experienceService.createExperience(req.body);

  res.status(httpStatus.CREATED).send(generateResponse(true, categories));
});

const updateExperience = catchAsync(async (req, res) => {
  const experience = await experienceService.updateExperience(req.body);
  console.log(experience);
  if (!experience) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not updated');
  }
  res.status(httpStatus.CREATED).send(generateResponse(true, experience));
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
  const { categoryName, startDay, endDay, minPrice, maxPrice, location, searchText } = req.body;

  const query = {};

  if (categoryName && categoryName.length > 0) {
    query.categoryName = { $in: categoryName };
  }

  if (startDay && endDay) {
    query.startDay = { $gte: startDay };
    // query.endDay = { $lte: endDay };
  }
  if (minPrice && maxPrice) {
    query.price = { $gte: minPrice, $lte: maxPrice };
  }
  if (location && location.length) {
    query.location = location;
  }
  let experiences;
  let experienceArray = [];
  let usersArray = [];
  if (searchText && searchText.length) {
    const experience = await Experience.find({ $text: { $search: searchText } });
    const user = await User.find({ $text: { $search: searchText } }).populate('experiences userId');

    if (user.length) {
      let users = [];
      user.map((item, idx) => {
        usersArray.push(item);
        users.push(JSON.parse(JSON.stringify(item)));
      });
      if (users.length) {
        users.map((item, idx) => {
          if (item.experiences && item.experiences.length) {
            item.experiences.forEach((element, idx) => {
              experienceArray.push(element);
            });
          }
        });
      }
    }
    experiences = experience;
  }

  // console.log(experienceArray);

  let categories = await Experience.find(query).exec();
  if (experiences) {
    categories = experiences;
  }
  let result;
  if (experienceArray.length) {
    result = experienceArray.filter((item) => {
      console.log(item);
      const today = new Date();
      const eDay = new Date(item.endDay);

      return eDay >= today;
    });
  } else {
    result = categories.filter((item) => {
      const today = new Date();
      const eDay = new Date(item.endDay);

      return eDay >= today;
    });
  }

  res.status(httpStatus.OK).send(generateResponse(true, { experiences: result, users: usersArray }));
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

const getHostExperiencesById = catchAsync(async (req, res) => {
  const experiences = await experienceService.getHostExperiencesById(req.params.id);
  if (!experiences) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Experience not found');
  }
  res.send(generateResponse(true, { experiences }));
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
  const experiencesCreated = await experienceService.createSpecificExperience(req.body, req.params.id);
  if (!experiencesCreated) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No experiences created');
  }
  res.send(generateResponse(true, { experiencesCreated }));
});

const rateSpecificExperience = catchAsync(async (req, res) => {
  const ratedExperience = await experienceService.rateSpecificExperience(req.body);
  if (!ratedExperience) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No experiences rated');
  }
  res.send(generateResponse(true, { ratedExperience }));
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

const buildUserZoomExperience = catchAsync(async (req, res) => {
  const experienceBuilt = await experienceService.buildUserZoomExperience(req.body);
  if (!experienceBuilt) {
    throw new ApiError(httpStatus.NOT_FOUND, "Experience wasn't built");
  }
  res.send(generateResponse(true, { experienceBuilt }));
});

const getBuiltExperience = catchAsync(async (req, res) => {
  const experienceBuilt = await experienceService.getUserZoomExperience(req.params.id);
  if (!experienceBuilt) {
    throw new ApiError(httpStatus.NOT_FOUND, "Experience wasn't built");
  }
  res.send(generateResponse(true, { experienceBuilt }));
});

const completeSpecificExperience = catchAsync(async (req, res) => {
  const completedExperience = await experienceService.completeSpecificExperience(req.body);
  if (!completedExperience) {
    throw new ApiError(httpStatus.NOT_FOUND, "Experience wasn't built");
  }
  res.send(generateResponse(true, { completedExperience }));
});

const uploadPhoto = catchAsync(async (req, res) => {
  const uploadedPhoto = await experienceService.uploadPhoto(req.file);
  if (!uploadedPhoto) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No photo uploaded');
  }
  res.send(generateResponse(true, { uploadedPhoto }));
});

module.exports = {
  createExperience,
  createSpecificExperience,
  rateSpecificExperience,
  getUserBookings,
  getAll,
  filterExperience,
  getExperience,
  addSpecificExperience,
  getHostExperiencesById,
  removeDateAvaibility,
  reserveExperience,
  updateExperience,
  buildUserZoomExperience,
  getBuiltExperience,
  completeSpecificExperience,
  uploadPhoto,
};
