/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/upload-avatar/:userId')
  .patch(auth('manageUsers'), validate(userValidation.checkUserID), userController.uploadAvatar);

router.route('/card/:userId').post(auth('manageUsers'), validate(userValidation.checkUserID), userController.addCard);
router
  .route('/card/:userId/:idx')
  .delete(auth('manageUsers'), validate(userValidation.removeCard), userController.deleteCard);

router.route('/bank/:userId').post(auth('manageUsers'), validate(userValidation.checkUserID), userController.addBank);
router
  .route('/bank/:userId/:idx')
  .delete(auth('manageUsers'), validate(userValidation.removeBank), userController.deleteBank);

module.exports = router;
