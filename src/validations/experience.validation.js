const Joi = require('@hapi/joi');
const { objectId } = require('./custom.validation');

const dateAvaibility = Joi.object().keys({
  day: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
});

const createExperience = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    duration: Joi.number().required(),
    price: Joi.number().required(),
    image: Joi.array().items(Joi.string()),
    dateAvaibility: Joi.array().items(dateAvaibility),
    categoryName: Joi.string().required(),
    userId: Joi.string().required(),
    startDay: Joi.string().required(),
    endDay: Joi.string().required(),
  }),
};

const getById = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
};

const addDateAvaibility = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    items: Joi.array().items(dateAvaibility),
  }),
};

const removeDateAvaibility = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    ids: Joi.array().items(Joi.string()),
  }),
};

const getAll = {};

module.exports = {
  createExperience,
  getAll,
  getById,
  addDateAvaibility,
  removeDateAvaibility,
};
