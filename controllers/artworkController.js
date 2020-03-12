//const multer = require('multer');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
//const upload = multer({ dest: 'uploads/' });
const ArtWork = require('../models/artWorkModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.uploadArtInfo = catchAsync(async (req, res, next) => {
  const artwork = new ArtWork({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    artist: req.body.artist,
    creationTime: req.body.creationTime,
    medium: req.body.medium,
    width: req.body.width,
    height: req.body.height,
    isForDownload: req.body.isForDownload,
    isForSale: req.body.isForDownload,
    isForRental: req.body.isForRental,
    isSoldorRented: req.body.isSoldorRented
  });
  await artwork.save();
  res.send('OK');
});

exports.uploadArtFileByTitleArtist = catchAsync(async (req, res, next) => {
  if (req.file.length === 0) {
    return next(new AppError('Please provide the file', 401));
  }
  const { file } = req;
  const fileInfo = {};
  fileInfo.mimetype = file.mimetype;
  fileInfo.originalname = file.originalname;
  fileInfo.size = file.size;
  fileInfo.filename = `${req.body.artist}-${req.body.title}.${
    file.originalname.split('.')[1]
  }`;
  fileInfo.path = `uploads/artworkFiles/${fileInfo.filename}`;
  await ArtWork.findOneAndUpdate(
    {
      title: req.body.title,
      artist: req.body.artist
    },
    { artworkfile: fileInfo, isPictureUpload: true },
    function(err, doc) {
      if (doc === null) {
        fs.unlinkSync(`uploads/artworkFiles/${file.filename}`);
        return console.log(err);
      }
      fs.mkdir(
        `uploads/artworkFiles/${req.body.artist}`,
        { recursive: true },
        error => {
          if (!error) {
            fs.renameSync(
              `uploads/artworkFiles/${file.filename}`,
              `uploads/artworkFiles/${req.body.artist}/${fileInfo.filename}`
            );
          }
        }
      );
      console.log(doc);
    }
  );
  res.end('File upload successful!');
});

exports.deleteAll = catchAsync(async (req, res, next) => {
  await ArtWork.deleteMany({});
  res.send('OK');
});
