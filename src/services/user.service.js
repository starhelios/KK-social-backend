const httpStatus = require('http-status');

const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { createStripeConnectAccount } = require('./payment.service');
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const user = await User.create(userBody);

  return user;
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

const getUserById = async (id) => {
  return User.findById(id);
};

const updateUserById = async (userId, updateBody) => {
  console.log('running');
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const keys = Object.keys(updateBody);
  for (let i = 0; i < keys.length; i++) {
    let elem = keys[i];
    if (elem === 'password' || elem === 'stripeConnectID') {
      continue;
    } else {
      user[`${elem}`] = updateBody[`${elem}`];
    }
  }
  if (user.isHost) {
    if ('stripeConnectID' in user) {
      if (!user.stripeConnectID.length > 0) {
        const getStripeConnectID = await createStripeConnectAccount(user._id);
        user[`stripeConnectID`] = getStripeConnectID;
      }
    } else {
      const getStripeConnectID = await createStripeConnectAccount(user._id);
      user[`stripeConnectID`] = getStripeConnectID;
    }
  }
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  getUserByEmail,
  queryUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
