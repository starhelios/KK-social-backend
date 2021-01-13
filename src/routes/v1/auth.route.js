const express = require('express');
const authController = require('../../controllers/auth.controller');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/google-login', validate(authValidation.googleLogin), authController.googleLogin);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/change-password', validate(authValidation.changePassword), authController.changePassword);
router.get(
  '/verification/verify-account/:userId/:secretCode',
  validate(authValidation.verifyAccount),
  authController.resetPassword
);

module.exports = router;
