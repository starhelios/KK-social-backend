const httpStatus = require('http-status');
const fetch = require('node-fetch');
const sgMail = require('@sendgrid/mail');
const catchAsync = require('../utils/catchAsync');
const googleOAuth = require('../utils/googleOAuth');
const { userService, authService, tokenService, emailService } = require('../services');
const { User } = require('../models');
const { generateResponse } = require('../utils/utils');
const colors = require('colors');
const { sendEmail } = require('../services/email.service');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  console.log(colors.green(user));
  const newUser = {
    status: user.status,
    fullname: user.fullname,
    email: user.email,
    randomString: user.randomString,
    avatarUrl: user.avatarUrl,
  };
  res.status(httpStatus.CREATED).send(generateResponse(true, { newUser, tokens }));
});

const generateCsrfToken = catchAsync(async (req, res) => {
  const token = await authService.generateCsrfToken(req);
  if (token.csrf && token.csrf.length) {
    res.send(generateResponse(true, { token }));
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'No token');
  }
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  console.log(colors.red(user));
  const newUser = {
    status: user.status,
    fullname: user.fullname,
    email: user.email,
    randomString: user.randomString,
    avatarUrl: user.avatarUrl,
    availableMethods: user.availableMethods,
    location: user.location,
    aboutMe: user.aboutMe,
    stripeAccount: user.stripeAccountVerified,
  };
  res.send(generateResponse(true, { newUser, tokens }));
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
  console.log(colors.cyan('user is here', user));

  const tokens = await tokenService.generateAuthTokens(user);

  const checkUser = await authService.checkUserWithEmailAndPassword(userGoogle.email, 'toilaUser1');
  console.log(colors.red(checkUser));
  if (checkUser) {
    const newCheckUser = {
      status: checkUser.status,
      fullname: checkUser.fullname,
      email: checkUser.email,
      randomString: checkUser.randomString,
      avatarUrl: checkUser.avatarUrl,
      availableMethods: checkUser.availableMethods,
      location: checkUser.location,
      aboutMe: checkUser.aboutMe,
    };
    res.send(generateResponse(true, { user: newCheckUser, tokens, setFirstPass: true }));
  } else {
    const newUser = {
      status: user.status,
      fullname: user.fullname,
      email: user.email,
      randomString: user.randomString,
      avatarUrl: user.avatarUrl,
      availableMethods: user.availableMethods,
      location: user.location,
      aboutMe: user.aboutMe,
    };
    res.send(generateResponse(true, { user: newUser, tokens }));
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
  const user = await User.findOne({ randomString: userId });
  console.log('password request...', req.body);

  if (setFirstPass) {
    await authService.changePasswordLoginWithGoogle(user._id, newPassword);
  } else {
    console.log('changing password');
    await authService.changePassword(user._id, password, newPassword);
  }

  res.send(generateResponse(true, null, 'Change password succeeded!'));
});
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const contactUs =  catchAsync(async (req, res) => {
  const msg = { from: req.body.email, to: process.env.EMAIL_FROM, subject: `Support ${req.body.id}`, text:  `Support case: ${req.body.id},

    Hi my name is ${req.body.name},

    ${req.body.message}
  `};
  sgMail.send(msg).then(
    (response) => {
      res.status(200).send({success: true, message: "Successfully sent"});
    },
    (error) => {
      res.status(400).send({status: false, message: "Something went wrong"});
    }
  );
})

module.exports = {
  register,
  generateCsrfToken,
  login,
  googleLogin,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  changePassword,
  contactUs
};
