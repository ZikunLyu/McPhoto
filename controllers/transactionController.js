const Transaction = require('./../models/transactionModel');
const ArtWork = require('../models/artWorkModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.createTransaction = catchAsync(async (req, res, next) => {
  await Transaction.create({
    sender_email: req.body.sender_email,
    receiver_email: req.body.receiver_email,
    type: req.body.type,
    artwork: req.body.artwork,
    artist: req.body.artist,
    artworkTitle: req.body.artworkTitle,
    msg: req.body.msg
  });

  res.status(200).json({
    status: 'success'
  });
});

exports.getTransactionSent = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(
      new AppError('Please provide email to get Transaction objects.', 400)
    );
  }

  const trans = await Transaction.find({ sender_email: email });

  res.status(200).json({
    status: 'success',
    trans
  });
});

exports.getTransactionReceived = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(
      new AppError('Please provide email to get Transaction objects.', 400)
    );
  }

  const trans = await Transaction.find({ receiver_email: email });

  res.status(200).json({
    status: 'success',
    trans
  });
});

exports.updateTransaction = catchAsync(async (req, res, next) => {
  const { transactionId, status } = req.body;
  const trans = await Transaction.findById(transactionId);
  // Can only update pending transaction
  if (trans.status !== 'pending') {
    return next(
      new AppError('Cannot update transaction which is not pending.', 400)
    );
  }

  const artwork = await ArtWork.findById(trans.artwork);
  // Verify the API is sent by receiver of the transaction
  if (trans.receiver_email !== artwork.artistEmail) {
    return next(
      new AppError(
        `Transaction receiver email does not match artwork's email`,
        400
      )
    );
  }

  if (status === 'finished') {
    await ArtWork.updateOne(
      { _id: artwork._id },
      { $push: { accessList: trans.sender_email } }
    );
  }
  trans.status = status;
  await trans.save();

  res.status(200).json({
    status: 'success'
  });
});
