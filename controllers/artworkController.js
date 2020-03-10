const ArtWork = require('../models/artWorkModel');
const catchAsync = require('./../utils/catchAsync');
//const AppError = require('./../utils/appError');

exports.upload = catchAsync(async (req, res, next) => {
  const artwork = new ArtWork({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    artist: req.body.artist,
    creationTime: req.body.creationTime,
    medium: req.body.medium,
    width: req.body.width,
    height: req.body.height
  });
  await artwork.save(function(err, result) {
    if (err) {
      res.status(500);
      return console.log(err.message);
    }
  });
  res.send('OK');
});

exports.deleteAll = catchAsync(async (req, res, next) => {
  await ArtWork.deleteMany({}, function(err, result) {
    if (err) {
      console.log(err.message);
    }
  });
  res.send('OK');
});
