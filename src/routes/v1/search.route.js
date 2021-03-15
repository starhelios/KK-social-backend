const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const searchController = require('../../controllers/search.controller');

const router = express.Router();

router.route('/').post(auth({}), validate({}), searchController.search);

module.exports = router;
