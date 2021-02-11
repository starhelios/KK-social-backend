const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const experienceValidation = require('../../validations');
const experienceController = require('../../controllers/experience.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(experienceValidation.createExperience), experienceController.createExperience)
  .get(validate({}), experienceController.getAll);
router.route('/createSpecificExperience/:id').post(experienceController.createSpecificExperience);
router.route('/rate').post(experienceController.rateSpecificExperience);

router.route('/reserve').post(validate(experienceValidation.reserveExperience), experienceController.reserveExperience); //TODO Add auth() to this route.
router.route('/reserved/:id').get(experienceController.getUserBookings);

router.post('/filter', validate({}), experienceController.filterExperience);

router.route('/:id').get(validate(experienceValidation.getById), experienceController.getExperience);

router
  .route('/dates/:id')
  .post(validate(experienceValidation.addSpecificExperience), experienceController.addSpecificExperience)
  .delete(validate(experienceValidation.removeDateAvaibility), experienceController.removeDateAvaibility);

module.exports = router;
