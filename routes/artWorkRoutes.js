const express = require('express');
const multer = require('multer');

const upload = multer({ dest: 'data/uploads/' });
const artworkController = require('../controllers/artworkController');
const artworkCompress = require('../controllers/artworkfileCompress');

const router = express.Router();

router.get('/artwork', artworkController.getArtworkById);
router.get('/artworks', artworkController.getAllArtworks);
router.get('/artworksNum', artworkController.getAllArtworksNum);
// TODO: call protect, as the API can only be called if logged in
router.post('/uploadArtInfo', artworkController.uploadArtInfo);
// TODO: call protect, as the API can only be called if logged in
router.post(
  '/uploadFileByTitleArtist',
  upload.single('file'),
  artworkController.uploadArtFileByTitleArtist
);
router.options(
  '/uploadFileByTitleArtist',
  artworkController.uploadArtFileByTitleArtistOptions
);
router.get('/compressByfilepath', artworkCompress.generateCompressedImage);
router.get(
  '/getFilepathByTitleArtist',
  artworkController.getFilepathByTitleArtist
);
router.get('/getArtworkListByArtist', artworkController.getArtworkListByArtist);
router.get(
  '/getArtworkListByArtistEmail',
  artworkController.getArtworkFileByArtistEmail
);
router.get('/getArtworkFileByArtist', artworkController.getArtworkFileByArtist);
router.get(
  '/getFileInfoByTitleArtist',
  artworkController.getFileInfoByTitleArtist
);
router.delete('/deleteAll', artworkController.deleteAll);
router.delete(
  '/deleteArtworkByTitleArtist',
  artworkController.deleteArtworkByTitleArtist
);
router.delete(
  '/deleteArtworkFilesByTitleArtist',
  artworkController.deleteArtworkFilesByTitleArtist
);

module.exports = router;
