const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { categoryService } = require('../services');
const { generateResponse } = require('../utils/utils');
const Category = require('../models/category.model');

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

const storagePath = `${__dirname}/../../public/avatar`;

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
  let reqBody = req.body;
  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const fileName = `${req.params.userId}.${mimeMatch[avatar.mimetype]}`;
    avatar.mv(`${storagePath}/${fileName}`);
    const avatarUrl = `http://${req.get('host')}/avatar/${fileName}`;
    reqBody = { ...req.body, avatarUrl };
  }
  if (req.body.categoryName) {
    const newCategoryName = req.body.categoryName.toLowerCase();
    const categories = await Category.find({ name: newCategoryName }, { name: 1 }).exec();
    if (categories.length === 0) await categoryService.createCategory({ name: newCategoryName });
  }

  const user = await userService.updateUserById(req.params.userId, reqBody);

  res.send(generateResponse(true, user, 'Change user info successed!'));
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const uploadAvatar = catchAsync(async (req, res) => {
  const avatar = req.files.avatar;
  const fileName = `${req.params.userId}.${mimeMatch[avatar.mimetype]}`;
  avatar.mv(`${storagePath}/${fileName}`);
  const avatarUrl = `http://${req.get('host')}/avatar/${fileName}`;
  const user = await userService.updateUserById(req.params.userId, { avatarUrl });

  res.send(generateResponse(true, user, 'Upload avatar successed!'));
});

const addCard = catchAsync(async (req, res) => {
  let user = await userService.getUserById(req.params.userId);
  user = await userService.updateUserById(req.params.userId, { paymentInfo: [...user.paymentInfo, req.body] });

  res.send(generateResponse(true, user, 'Add Card successed!'));
});

const deleteCard = catchAsync(async (req, res) => {
  let user = await userService.getUserById(req.params.userId);
  user.paymentInfo.splice(req.params.cardIdx, 1);
  user = await userService.updateUserById(req.params.userId, {
    paymentInfo: user.paymentInfo,
  });

  res.send(generateResponse(true, user, 'Delete Card successed!'));
});

const addBank = catchAsync(async (req, res) => {
  let user = await userService.getUserById(req.params.userId);
  user = await userService.updateUserById(req.params.userId, { bankInfo: [...user.bankInfo, req.body] });

  res.send(generateResponse(true, user, 'Add Bank successed!'));
});

const deleteBank = catchAsync(async (req, res) => {
  let user = await userService.getUserById(req.params.userId);
  user.bankInfo.splice(req.params.cardIdx, 1);
  user = await userService.updateUserById(req.params.userId, {
    bankInfo: user.bankInfo,
  });

  res.send(generateResponse(true, user, 'Delete Bank successed!'));
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getHosts,
  getHost,
  uploadAvatar,
  addCard,
  deleteCard,
  addBank,
  deleteBank,
};
