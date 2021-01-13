const Joi = require('@hapi/joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    fullname: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const googleLogin = {
  body: Joi.object().keys({
    code: Joi.string(),
    accessToken: Joi.string(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    password: Joi.string().custom(password),
    newPassword: Joi.string().required().custom(password),
    userId: Joi.string().required(),
    setFirstPass: Joi.bool(),
  }),
};

const verifyAccount = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
    secretCode: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyAccount,
  changePassword,
};
