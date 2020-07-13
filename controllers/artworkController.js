//const multer = require('multer');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');

const ArtWork = require('../models/artWorkModel');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

/*
  Controller method: upload the information of an artwork
  fetch the fields from the http request
  And write it to the database
 */
exports.uploadArtInfo = catchAsync(async (req, res, next) => {
  await User.findOne({ name: req.body.artist }, function(err, doc) {
    if (err) {
      console.log(err);
    }
    if (!doc) {
      return next(new AppError('The artist need to sign up first', 401));
    }
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
    artwork.save();
  });
});

/*
  Controller method: upload the file of the artwork by the title and artist
  Note that the title of an artwork is only unique when combined with its artist
 */
exports.uploadArtFileByTitleArtist = catchAsync(async (req, res, next) => {
  if (req.file.length === 0) {
    return next(new AppError('Please provide the file', 401));
  }
  /* fetch fields from http request and then reassmable it to a database record
      The API has different fields with the database */
  const { file } = req;
  const fileInfo = {};
  fileInfo.mimetype = file.mimetype;
  fileInfo.originalname = file.originalname;
  fileInfo.size = file.size;
  fileInfo.filename = `${req.body.artist}-${req.body.title}_origin.${
    file.mimetype.split('/')[file.mimetype.split('/').length - 1]
  }`; //rename the file
  fileInfo.path = `data/uploads/${req.body.artist}/artworkFiles/original/${fileInfo.filename}`;
  /* call the API of Model Artwork, find the target artwork by title and artist
   info and upload the file */
  await ArtWork.findOneAndUpdate(
    {
      title: req.body.title,
      artist: req.body.artist
    },
    { artworkfile: fileInfo, isPictureUpload: true },
    function(err, doc) {
      if (doc === null) {
        fs.unlinkSync(`data/uploads/${file.filename}`);
        return console.log(err);
      } //If the document is not found in the database, then delete the uploaded file right away
      fs.mkdir(
        `data/uploads/${req.body.artist}/artworkFiles/original`,
        { recursive: true },
        error => {
          if (!error) {
            fs.renameSync(
              `data/uploads/${file.filename}`,
              `data/uploads/${req.body.artist}/artworkFiles/original/${fileInfo.filename}`
            );
          }
        }
      );
      //Save the file in the file system and rename the binary name to actual file name
      //The code for save file path is in artWorkRoutes.js
      console.log(doc);
    }
  );
  res.status(200).json({
    path: fileInfo.path
  });
  res.end('File upload successful!');
});

exports.getFilepathByTitleArtist = catchAsync(async (req, res, next) => {
  await ArtWork.findOne(
    {
      title: req.query.title,
      artist: req.query.artist
    },
    function(err, doc) {
      if (err) {
        console.log(err);
      }
      if (doc == null) {
        return next(new AppError('The artwork does not exist'));
      }
      res.send(doc.artworkfile.path);
    }
  );
});

exports.deleteAll = catchAsync(async (req, res, next) => {
  await ArtWork.deleteMany({});
  res.send('All artwork deleted');
});
