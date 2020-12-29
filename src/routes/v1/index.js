const express = require('express');

const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const categoryRoute = require('./category.route');
const experienceRoute = require('./experience.route');
const hostRoute = require('./host.route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/categories', categoryRoute);
router.use('/experiences', experienceRoute);
router.use('/hosts', hostRoute);

module.exports = router;
