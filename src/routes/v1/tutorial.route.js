/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tutorialController = require('../../controllers/tutorial.controller');
const tutorialValidation = require('../../validations/tutorial.validation');

const router = express.Router();

router
  .route('/')
  .get(auth(), validate({}), tutorialController.getTutorials)
  .post(auth(), validate(tutorialValidation.createTutorial), tutorialController.createTutorial);

router.route('/:id').delete(auth(), validate({}), tutorialController.removeTutorial);

module.exports = router;
