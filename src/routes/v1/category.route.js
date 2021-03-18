/**
* @swagger
* tags:
*   name: Category
*   description: Category management
*/

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const categoryValidation = require('../../validations');
const categoryController = require('../../controllers/category.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageCategories'), validate(categoryValidation.createCategory), categoryController.createCategory);

router.route('/search').get(validate(categoryValidation.searchCategory), categoryController.searchCategory);

module.exports = router;
