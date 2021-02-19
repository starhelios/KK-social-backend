const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const experienceValidation = require('../../validations');
const experienceController = require('../../controllers/experience.controller');
const uploadPhotoUtil = require('../../utils/photoUpload');

const router = express.Router();

router
  .route('/')
  .post(validate(experienceValidation.createExperience), experienceController.createExperience)
  .get(validate({}), experienceController.getAll);
router.route('/createSpecificExperience/:id').post(experienceController.createSpecificExperience);
router.route('/rate').post(experienceController.rateSpecificExperience);
router.route('/build').post(experienceController.buildUserZoomExperience);
router.route('/build/:id').get(experienceController.getBuiltExperience);
router.route('/complete').post(experienceController.completeSpecificExperience);

router.route('/reserve').post(validate(experienceValidation.reserveExperience), experienceController.reserveExperience); //TODO Add auth() to this route.
router.route('/reserved/:id').get(experienceController.getUserBookings);

router.post('/filter', validate({}), experienceController.filterExperience);
router.route('/uploadPhoto').post(uploadPhotoUtil.uploader.single('image'), experienceController.uploadPhoto);

router.route('/:id').get(validate(experienceValidation.getById), experienceController.getExperience);

router
  .route('/dates/:id')
  .post(validate(experienceValidation.addSpecificExperience), experienceController.addSpecificExperience)
  .delete(validate(experienceValidation.removeDateAvaibility), experienceController.removeDateAvaibility);

module.exports = router;
