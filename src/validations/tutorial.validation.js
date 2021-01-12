const Joi = require('@hapi/joi');

const createTutorial = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    image: Joi.string(),
  }),
};

module.exports = {
  createTutorial,
};
