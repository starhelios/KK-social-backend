/**
* @swagger
* tags:
*   name: Search
*   description: Search management
*/

const express = require('express');
const validate = require('../../middlewares/validate');
const searchController = require('../../controllers/search.controller');

const router = express.Router();

router.route('/').post(validate({}), searchController.search);

module.exports = router;
