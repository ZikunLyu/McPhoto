const express = require('express');
const tourController = require('./../controllers/testController');

const router = express.Router();

router.route('/test').post(tourController.createStudent);

module.exports = router;
