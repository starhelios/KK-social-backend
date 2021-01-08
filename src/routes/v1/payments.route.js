const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const paymentController = require('../../controllers/payments.controller');

const router = express.Router();

router.route('/generate/account_link/:userId').get(auth(), validate({}), paymentController.generateAccountLink);

router.route('/charge-generate-intent/experience').post(auth(), validate({}), paymentController.chargeCustomer);
router.route('/stripe/webhook').post(validate({}), paymentController.generateAccountLink);

module.exports = router;
