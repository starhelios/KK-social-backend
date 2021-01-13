const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const experienceValidation = require('../../validations');
const experienceController = require('../../controllers/experience.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(experienceValidation.createExperience), experienceController.createExperience)
  .get(validate({}), experienceController.getAll);

router.post('/filter', validate({}), experienceController.filterExperience);

router.route('/:id').get(validate(experienceValidation.getById), experienceController.getExperience);

router
  .route('/dates/:id')
  .post(validate(experienceValidation.addDateAvaibility), experienceController.addDateAvaibility)
  .delete(validate(experienceValidation.removeDateAvaibility), experienceController.removeDateAvaibility);

module.exports = router;
