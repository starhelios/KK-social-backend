const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { generateResponse } = require('../utils/utils');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  res.send(generateResponse(true, user));
});

const getHost = catchAsync(async (req, res) => {
  // const userID = req.user._id;
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Host not found');
  }

  res.send(generateResponse(true, { user, ratingMark: 5, ratingCount: 100 }));
});

const getHosts = catchAsync(async (req, res) => {
  const filter = { isHost: true };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);

  res.send(generateResponse(true, result));
});

const updateUser = catchAsync(async (req, res) => {
  const userID = req.user._id;
  const user = await userService.updateUserById(userID, req.body);

  res.send(generateResponse(true, user, 'Change user info successed!'));
});

const deleteUser = catchAsync(async (req, res) => {
  const userID = req.user._id;
  await userService.deleteUserById(userID);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getHosts,
  getHost,
};
