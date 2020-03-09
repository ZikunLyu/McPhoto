const express = require('express');
const tourController = require('./../controllers/testController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/test')
  // Here calling authController.protect before tourController.createStudent, is an example of how we control the user's access, protect checks whether user is logged in to make the API request
  .post(
    authController.protect,
    authController.restrictTo('admin', 'd'),
    tourController.createStudent
  );

module.exports = router;
