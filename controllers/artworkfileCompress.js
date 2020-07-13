const { execFile } = require('child_process');
const catchAsync = require('./../utils/catchAsync');

exports.generateCompressedImage = catchAsync(async (req, res, next) => {
  const imagePath = req.query.filepath
  console.log(imagePath);
  await execFile(
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
      }
    }
  );
  console.log('small size image generated!')
  await execFile(
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
      }
    }
  );
  console.log('medium size image generated!')
  await execFile(
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
      }
    }
  );
  console.log('Large size image generated!')
  res.end('Compressed image sucessfully generated!');
});
