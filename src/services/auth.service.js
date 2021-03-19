const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const bcrypt = require('bcryptjs');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Code } = require('../models');

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect email or password');
  }

  return user;
};

const checkUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);

  if (!user || !(await user.isPasswordMatch(password))) {
    return null;
  }

  return user;
};

const loginUserWithEmail = async (email) => {
  const user = await userService.getUserByEmail(email);

  return user;
};

const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      return false;
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    await userService.updateUserById(user.id, { password: newPassword });

    return true;
  } catch (error) {
    return false;
  }
};

const changePassword = async (userId, password, newPassword) => {
  const user = await userService.getUserById(userId);

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect password');
  }
};

const changePasswordLoginWithGoogle = async (userId, newPassword) => {
  const user = await userService.getUserById(userId);
  await userService.updateUserById(user.id, { password:  await bcrypt.hash(newPassword, 8) }, { upsert: true, new: true });
};

const generateCsrfToken = async (req) => {
  return { csrf: req.csrfToken() };
};

const verifyAccount = async (userId, secretCode) => {
  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return false;
    }
    const code = await Code.findOne({
      email: user.email,
      code: secretCode,
    });

    // await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    // await userService.updateUserById(user.id, { password: newPassword });

    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  loginUserWithEmail,
  changePassword,
  changePasswordLoginWithGoogle,
  generateCsrfToken,
  checkUserWithEmailAndPassword,
};
