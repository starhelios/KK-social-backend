const Joi = require('@hapi/joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    fullname: Joi.string().required(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    fullname: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getHosts = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  // body: Joi.object()
  //   .keys({
  //     email: Joi.string().email(),
  //     password: Joi.string().custom(password),
  //     dateOfBirth: Joi.date(),
  //     fullname: Joi.string(),
  //     avatarUrl: Joi.string(),
  //     categoryName: Joi.string(),
  //     aboutMe: Joi.string(),
  //     isHost: Joi.boolean(),
  //     availableMethods: Joi.array(),
  //     stripeCustomerID: Joi.string(),
  //     stripeConnectID: Joi.string(),
  //   })
  //   .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const checkUserID = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getHosts,
  checkUserID,
};
