const Joi = require('@hapi/joi');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
  }),
};

const searchCategory = {
  query: Joi.object().keys({
    q: Joi.string(),
  }),
};

module.exports = {
  createCategory,
  searchCategory,
};
