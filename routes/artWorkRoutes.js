const express = require('express');
const multer = require('multer');

const upload = multer({ dest: 'data/uploads/' });
const artworkController = require('../controllers/artworkController');
const artworkCompress = require('../controllers/artworkfileCompress');

const router = express.Router();

router.post('/uploadArtInfo', artworkController.uploadArtInfo);
router.post(
  '/uploadFileByTitleArtist',
  upload.single('file'),
  artworkController.uploadArtFileByTitleArtist
);
router.get('/compressByfilepath', artworkCompress.generateCompressedImage);
router.get(
  '/getFilepathByTitleArtist',
  artworkController.getFilepathByTitleArtist
);
router.delete('/deleteAll', artworkController.deleteAll);

module.exports = router;
