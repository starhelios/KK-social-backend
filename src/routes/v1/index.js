const express = require('express');

const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const categoryRoute = require('./category.route');
const experienceRoute = require('./experience.route');
const hostRoute = require('./host.route');
const paymentsRoute = require('./payments.route');
const tutorialRoute = require('./tutorial.route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/experiences', experienceRoute);
router.use('/hosts', hostRoute);
router.use('/payments', paymentsRoute);
router.use('/tutorials', tutorialRoute);

module.exports = router;
