const httpStatus = require('http-status');
const axios = require('axios');
const randomstring = require('randomstring');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { createStripeConnectAccount } = require('./payment.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const randomString = randomstring.generate();
  userBody.randomString = randomString;
  if (!userBody.avatarUrl) {
    userBody.avatarUrl = '';
  }
  const user = await User.create(userBody);

  return user;
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const queryUsers = async (filter) => {
  // const users = await User.paginate(filter, options).select().exec();
  const users = await User.find({ isHost: true })
    .populate({
      path: 'experiences',
      select: ['title', 'description', 'price', 'startDay', 'endDay', 'location', 'images', 'ratings', 'categoryName'],
      populate: {
        path: 'specificExperience',
        select: ['ratings'],
      },
    })
    .select({ fullname: 1, avatarUrl: 1, location: 1, joinDay: 1, aboutMe: 1 })
    .limit(10);

  return users;
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  console.log('getting all by user id...');

  if (user.isHost) {
    const populateQuery = {
      path: 'experiences',
      populate: {
        path: 'specificExperience',
        model: 'Specific Experience',
        populate: {
          path: 'ratings',
          model: 'Rating',
        },
      },
    };

    const account = await stripe.accounts.retrieve(user.stripeConnectID);
    const updatedUser = await User.findByIdAndUpdate(
      { _id: id },
      { stripeAccountVerified: account.details_submitted },
      { upsert: true, new: true }
    )
      .populate(populateQuery)
      .exec();
    console.log('updatedUser', updatedUser);
    console.log(updatedUser);
    return updatedUser;
  } else {
    return user;
  }
};

const updateUserById = async (userId, updateBody) => {
  console.log(userId);
  console.log('running');
  console.log('update body', updateBody);
  const { zoomAuthToken, email } = updateBody;
  if (zoomAuthToken && zoomAuthToken.length) {
    const response = await axios({
      url: `https://zoom.us/oauth/token?grant_type=authorization_code&code=${zoomAuthToken}&redirect_uri=https://www.kloutkast.com/profile`, //needs to reciprocate redirect for frontend
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.ZOOM_CLIENT_ID + ':' + process.env.ZOOM_CLIENT_SECRET).toString(
          'base64'
        )}`,
      },
    });
    const { access_token, refresh_token } = response.data;
    const user = await axios({
      url: 'https://api.zoom.us/v2/users/me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const { id } = user.data;
    User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        zoomId: id,
        zoomAccessToken: access_token,
        zoomRefreshToken: refresh_token,
        zoomConnected: true,
      },
      { new: true },
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
    if (updateBody.password) {
      const updatedUser = await (
        await User.findByIdAndUpdate({ _id: userId }, { password: updateBody.password }, { upsert: true, new: true })
      ).save();
      console.log(updatedUser);
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
