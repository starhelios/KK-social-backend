const httpStatus = require('http-status');
const moment = require('moment');
const { Experience, User, SpecificExperience, Reservation, Rating } = require('../models');
const { populate } = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const getExperienceByName = async (name) => {
  return Experience.findOne({ name });
};

const createExperience = async (experienceBody) => {
  console.log(experienceBody);
  const {
    title,
    description,
    duration,
    price,
    images,
    startDay,
    endDay,
    categoryName,
    userId,
    specificExperiences,
  } = experienceBody;
  if (await Experience.isTitleTaken(title)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Experience name already taken');
  }
  const { location } = await User.findById({ _id: userId });
  const newExperience = {
    title,
    description,
    duration,
    price,
    images,
    startDay,
    endDay,
    categoryName,
    userId,
    location,
  };
  const savedExperience = await Experience.create(newExperience);
  console.log(savedExperience);
  specificExperiences.forEach((element) => {
    element.imageUrl = savedExperience.images[0];
    element.experience = savedExperience._id;
  });
  console.log(specificExperiences);
  const savedSpecificExperiences = await SpecificExperience.insertMany(specificExperiences);
  let experienceIds = savedSpecificExperiences.map((item, idx) => {
    return item._id;
  });
  const pushToExperienceModel = await Experience.findByIdAndUpdate(
    { _id: savedExperience._id },
    { $push: { specificExperience: experienceIds } }
  );
  console.log(pushToExperienceModel);

  return { savedExperience, savedSpecificExperiences, pushToExperienceModel };
};

const createSpecificExperience = async (experienceBody, id) => {
  const { startTime, endTime } = experienceBody.specificExperiences;
  const getExperience = await Experience.findOne({ _id: id });
  const experienceId = id;
  for (i = 1; i <= 40; i++) {
    let object = {
      experience: experienceId,
      day: moment(new Date(new Date().getTime() + 86400000 * i)).format('LL'),
      startTime,
      endTime,
      imageUrl: getExperience.images[0],
    };
    const createdExperience = await SpecificExperience.create(object);
    const pushedExperience = await Experience.findByIdAndUpdate(
      { _id: experienceId },
      { $push: { specificExperience: createdExperience._id } }
    );
    if (i === 40) {
      return pushedExperience;
    }
  }
};

const rateSpecificExperience = async (data) => {
  const { experienceId, rating, userId } = data;
  const obj = {
    specificExperience: experienceId,
    rating,
    userId,
  };
  const alreadyRatedExperience = await Rating.findOne({ specificExperience: experienceId, userId: userId });
  if (!alreadyRatedExperience) {
    const rateExperience = await Rating.create(obj);
    const pushToSpecificExperience = await SpecificExperience.findByIdAndUpdate(
      { _id: experienceId },
      { $push: { ratings: rateExperience._id } }
    );
    console.log(pushToSpecificExperience);
    return { rateExperience, pushToSpecificExperience };
  } else {
    const rateExperience = await Rating.findOneAndUpdate(
      { specificExperience: experienceId, userId: userId },
      { obj },
      { upsert: true, new: true }
    );
    return rateExperience;
  }
};

const reserveExperience = async (data) => {
  const { id, paymentIntent, imageUrl, guests, userId } = data;
  //TODO charge card
  const specificExp = await SpecificExperience.findOneAndUpdate(
    { _id: id },
    { $push: { usersGoing: userId }, imageUrl: imageUrl },
    { upsert: true, new: true }
  );
  const reservation = await Reservation.create({ specificExperience: specificExp._id, numberOfGuests: guests });
  return { ...specificExp, ...reservation };
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
  const findExperience = await Experience.findOne({ _id: id }).populate('specificExperience').exec();

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
    specificExperience,
    startDay,
    endDay,
    userId,
    createAt,
    updatedAt,
    location,
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
    specificExperience,
    startDay,
    endDay,
    userId,
    createAt,
    updatedAt,
    location,
    hostData: {
      fullname: findHostInfo.fullname,
      email: findHostInfo.email,
    },
  };
  return responseData;
};

const getUserBookings = async (id) => {
  const populateQuery = [
    {
      path: 'experience',
      populate: {
        path: 'specificExperience',
        model: 'Specific Experience',
      },
    },
    {
      path: 'ratings',
    },
  ];
  const userBookings = await SpecificExperience.find({ usersGoing: id }).populate(populateQuery).exec();
  console.log(userBookings);
  if (!userBookings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bookings not found');
  }
  return userBookings;
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
  createSpecificExperience,
  rateSpecificExperience,
  reserveExperience,
  getUserBookings,
  getAll,
  getExperienceById,
  updateExperienceById,
  deleteExperienceById,
};
