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

router.route('/bank/:userId').post(auth('manageUsers'), validate(userValidation.addBank), userController.addBank);
router
  .route('/bank/:userId/:id')
  .delete(auth('manageUsers'), validate(userValidation.removeBank), userController.deleteBank);

router.route('/booking/reservation/:userId').post(auth('manageUsers'), validate(userValidation.reservationBooking), userController.reservationBooking);
router.route('/booking/join/:userId/:id').post(auth('manageUsers'), validate(userValidation.joinBooking), userController.joinBooking);


module.exports = router;
