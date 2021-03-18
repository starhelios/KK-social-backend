/**
* @swagger
* tags:
*   name: Payment
*   description: Payment management
*/

const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const paymentController = require('../../controllers/payments.controller');

const router = express.Router();

router.route('/generate/account_link').get(auth(), validate({}), paymentController.generateAccountLink);

router.route('/charge-generate-intent/experience').post(auth(), validate({}), paymentController.chargeCustomer);
router.route('/methods/card').post(auth(), validate({}), paymentController.savePaymentMethod);
router.route('/save-transaction').post(auth(), validate({}), paymentController.savePaymentTransactionInDB);
router.route('/delete-payment-method').post(auth(), validate({}), paymentController.deletePaymentMethod);
router.route('/delete-payment').post(auth(), validate({}), paymentController.deletePayment);

// router.route('/stripe/webhook').post(validate({}), paymentController.generateAccountLink);

module.exports = router;
