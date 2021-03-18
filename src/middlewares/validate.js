const Joi = require('@hapi/joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { Experience, User } = require('../models');
const colors = require('colors');

const validate = (schema) => async (req, res, next) => {
  try {
    //checking the parameters
    if (req.params.userId) {
      console.log(colors.red(req.params.userId));
      const response = await User.findOne({ randomString: req.params.userId });
      req.params = { userId: `${response._id}` };
    } else if (req.params.experienceId) {
      console.log('running');
      console.log(req.params);
      const responseOne = await Experience.findOne({ _id: req.params.experienceId });
      if (!Object.keys(responseOne).length) {
        const response = await Experience.findOne({ randomString: req.params.experienceId }); //experienceId
        req.params = { experienceId: `${response._id}` };
        console.log(colors.bgMagenta('response!!!!!', response));
      } else {
        req.params = { experienceId: `${responseOne._id}` };
      }
    } else if (req.params.reservedId) {
      console.log(colors.bgYellow(req.params.reservedId));
      const response = await User.findOne({ randomString: req.params.reservedId });
      console.log('response...', response._id);
      req.params = { reservedId: `${response._id}` };
    } else if (req.params.hostId) {
      return true;
    }

    console.log('params', req.params);

    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' } })
      .validate(object);
    // console.log(object);
    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
  } catch (err) {
    console.log(err);
  }
};

module.exports = validate;
