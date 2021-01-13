const httpStatus = require('http-status');
const fetch = require('node-fetch');
const catchAsync = require('../utils/catchAsync');
const googleOAuth = require('../utils/googleOAuth');
const { userService, authService, tokenService, emailService } = require('../services');
const { generateResponse } = require('../utils/utils');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.CREATED).send(generateResponse(true, { user, tokens }));
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);

  res.send(generateResponse(true, { user, tokens }));
});

const googleLogin = catchAsync(async (req, res) => {
  const { code, accessToken } = req.body;
  let profile;
  if (code) {
    profile = await googleOAuth.getProfileInfo(code);
  } else if (accessToken) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
    profile = await response.json();
  }

  const userGoogle = {
    googleId: profile.id,
    name: profile.name,
    firstName: profile.given_name,
    lastName: profile.family_name,
    email: profile.email,
    profilePic: profile.picture,
  };

  let user = await userService.getUserByEmail(userGoogle.email);

  if (!user) {
    user = await userService.createUser({
      email: userGoogle.email,
      fullname: userGoogle.name,
      password: 'toilaUser1',
      avatarUrl: userGoogle.profilePic,
      status: 'active',
    });
  }

  const tokens = await tokenService.generateAuthTokens(user);

  const checkUser = await authService.checkUserWithEmailAndPassword(userGoogle.email, 'toilaUser1');

  if (checkUser) {
    res.send(generateResponse(true, { user: checkUser, tokens, setFirstPass: true }));
  } else {
    res.send(generateResponse(true, { user, tokens }));
  }
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.send({ payload: null, error: false, message: 'Sent, please check your email!' });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await authService.resetPassword(req.query.token, req.body.password);

  if (result) {
    res.send(generateResponse(true, null, 'Reset password successed!'));
  } else {
    res.send(generateResponse(false, null, 'Reset password failed!'));
  }
});

const changePassword = catchAsync(async (req, res) => {
  const { userId, password, newPassword, setFirstPass } = req.body;

  if (setFirstPass) {
    await authService.changePasswordLoginWithGoogle(userId, newPassword);
  } else {
    await authService.changePassword(userId, password, newPassword);
  }

  res.send(generateResponse(true, null, 'Change password successed!'));
});

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  changePassword,
};
