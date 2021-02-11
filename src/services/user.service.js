const httpStatus = require('http-status');
const request = require('request-promise');
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
  console.log(userId);
  console.log('running');
  const { zoomAuthToken, email } = updateBody;
  if (zoomAuthToken && zoomAuthToken.length) {
    const response = await request({
      url: `https://zoom.us/oauth/token?grant_type=authorization_code&code=${zoomAuthToken}&redirect_uri=http://localhost:3000/profile/zoom-confirmation`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.ZOOM_CLIENT_ID + ':' + process.env.ZOOM_CLIENT_SECRET).toString(
          'base64'
        )}`,
      },
    });
    const { access_token, refresh_token } = JSON.parse(response);
    const user = await request({
      url: 'https://api.zoom.us/v2/users/me',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const { id } = JSON.parse(user);
    console.log(JSON.parse(user));
    console.log(refresh_token.length);
    User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        zoomId: id,
        zoomAccessToken: access_token,
        zoomRefreshToken: refresh_token,
      },
      function (err, docs) {
        console.log(docs);
        return docs;
      }
    );
  } else {
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
  }
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
