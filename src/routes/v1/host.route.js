const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.route('/').get(validate(userValidation.getHosts), userController.getHosts);

router.route('/:hostId').get(validate({}), userController.getHost);

module.exports = router;
