const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { categoryService } = require('../services');
const { generateResponse } = require('../utils/utils');
const Category = require('../models/category.model');
const colors = require('colors');

const mimeMatch = {
  'image/png': 'png',
  'image/tiff': 'tif',
  'image/vnd.wap.wbmp': 'wbmp',
  'image/x-icon': 'ico',
  'image/x-jng': 'jng',
  'image/x-ms-bmp': 'bmp',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
};

// const storagePath = `${__dirname}/../../public/avatar`;

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const newUser = {
    status: user.status,
    fullname: user.fullname,
    email: user.email,
    randomString: user.randomString,
    avatarUrl: user.avatarUrl,
  };
  res.status(httpStatus.CREATED).send(newUser);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  let user = await userService.getUserById(req.params.userId);
  console.log(colors.red('this is the user', user));

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  console.log(colors.bgCyan(user));
  const {
    experiences,
    fullname,
    email,
    avatarUrl,
    zoomConnected,
    isHost,
    status,
    images,
    randomString,
    availableMethods,
    dateOfBirth,
    aboutMe,
    location,
    zoomAccessToken,
  } = user;
  const newUser = {
    experiences,
    fullname,
    email,
    avatarUrl,
    zoomConnected,
    isHost,
    status,
    images,
    randomString,
    availableMethods,
    dateOfBirth,
    aboutMe,
    location,
    zoomAccessToken,
  };

  user = newUser;

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
  console.log(colors.green(result));
  res.send(generateResponse(true, result));
});

const updateUser = catchAsync(async (req, res) => {
  /*
  let reqBody = req.body;
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const fileName = `${req.params.userId}.${mimeMatch[avatar.mimetype]}`;
    avatar.mv(`${storagePath}/${fileName}`);
    const avatarUrl = `http://${req.get('host')}/avatar/${fileName}`;
    reqBody = { ...req.body, avatarUrl };
  }

  const user = await userService.updateUserById(req.params.userId, reqBody);
*/

  if (req.body.categoryName) {
    const newCategoryName = req.body.categoryName.toLowerCase();
    const categories = await Category.find({ name: newCategoryName }, { name: 1 }).exec();
    if (categories.length === 0) await categoryService.createCategory({ name: newCategoryName });
  }

  const user = await userService.updateUserById(req.params.userId, req.body);

  res.send(generateResponse(true, user, user));
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
