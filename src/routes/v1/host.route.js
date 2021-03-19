/**
* @swagger
* tags:
*   name: Host
*   description: Host management
*/

const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.route('/').get(validate(userValidation.getHosts), userController.getHosts);

router.route('/:userId').get(validate({}), userController.getHost);

module.exports = router;
