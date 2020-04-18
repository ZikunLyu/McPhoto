const express = require('express');
const authController = require('./../controllers/authController');
const paymentController = require('./../controllers/paymentController');

const router = express.Router();

router.get(
  '/checkout/:artworkId',
  authController.protect,
  paymentController.getCheckoutSession
);

module.exports = router;
