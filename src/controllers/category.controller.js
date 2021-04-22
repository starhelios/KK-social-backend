const httpStatus = require('http-status');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');
const { generateResponse } = require('../utils/utils');
const Category = require('../models/category.model');
const colors = require('colors');

const createCategory = catchAsync(async (req, res) => {
  const categories = await categoryService.createCategory(req.body);

  res.status(httpStatus.CREATED).send(generateResponse(true, categories));
});

const searchCategory = catchAsync(async (req, res) => {
  const { q } = req.query;
  const regex = new RegExp(q, 'i');

  const categories = await Category.find({ name: regex }, { name: 1 }).exec();

  res.status(httpStatus.OK).send(generateResponse(true, categories));
});

module.exports = {
  createCategory,
  searchCategory,
};
