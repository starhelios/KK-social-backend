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
router.route('/rate').post(auth({}), experienceController.rateSpecificExperience);
router.route('/build').post(auth({}), experienceController.buildUserZoomExperience);
router.route('/build/:id').get(auth({}), experienceController.getBuiltExperience);
router.route('/complete').post(auth({}), experienceController.completeSpecificExperience);
router.route('/updateExperience').post(experienceController.updateExperience);

router.route('/getHostExperiences/:userId').get(validate(), experienceController.getHostExperiencesById);

router
  .route('/reserve')
  .post(auth({}), validate(experienceValidation.reserveExperience), experienceController.reserveExperience); //TODO Add auth() to this route.
router
  .route('/reserved/:reservedId')
  .get(auth(), validate(experienceValidation.getByReservedId), experienceController.getUserBookings);

router.route('/uploadPhoto').post(auth({}), uploadPhotoUtil.uploader.single('image'), experienceController.uploadPhoto);

router.post('/filter', validate({}), experienceController.filterExperience);

router.route('/:experienceId').get(validate(experienceValidation.getById), experienceController.getExperience);

router
  .route('/dates/:id')
  .post(validate(experienceValidation.addSpecificExperience), experienceController.addSpecificExperience)
  .delete(validate(experienceValidation.removeDateAvaibility), experienceController.removeDateAvaibility);

/// Experience route '/v1/experiences/
module.exports = router;
