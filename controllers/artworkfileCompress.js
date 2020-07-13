const { execFile } = require('child_process');
const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const getCompressedImage = catchAsync(async (imagePath, res) => {
  execFile(
    'python3',
    [
      'controllers/imageCompress/compress.py',
      `${imagePath}`,
      550,
      10,
      90,
      1280,
      'small'
    ],
    function(error) {
      if (error) {
        console.error(`error:${error}`);
      } else console.log('> small size image generated!');
    }
  );
  execFile(
    'python3',
    [
      'controllers/imageCompress/compress.py',
      `${imagePath}`,
      850,
      10,
      90,
      1920,
      'medium'
    ],
    function(error) {
      if (error) {
        console.error(`error:${error}`);
      } else console.log('> medium size image generated!');
    }
  );
  execFile(
    'python3',
    [
      'controllers/imageCompress/compress.py',
      `${imagePath}`,
      2000,
      10,
      90,
      3140,
      'large'
    ],
    function(error) {
      if (error) {
        console.error(`error:${error}`);
      } else console.log('> Large size image generated!');
    }
  );
});

exports.generateCompressedImage = catchAsync(async (req, res, next) => {
  const imagePath = req.query.imagePathReq;
  await fs.access(imagePath, fs.constants.R_OK, err => {
    if (err) {
      console.error(`error:${err}`);
      return next(new AppError('Image file does not exist', 401));
    }
    getCompressedImage(imagePath, res);
  });
  res.end(' > compressed image successfully generated!');
});
