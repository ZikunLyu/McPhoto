const express = require('express');
const transactionController = require('./../controllers/transactionController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post(
  '/transaction',
  //authController.protect,
  transactionController.createTransaction
);
router.get(
  '/getTransactionSent',
  //authController.protect,
  transactionController.getTransactionSent
);
router.get(
  '/getTransactionReceived',
  //authController.protect,
  transactionController.getTransactionReceived
);
router.patch(
  '/updateTransaction',
  //authController.protect,
  transactionController.updateTransaction
);

module.exports = router;
