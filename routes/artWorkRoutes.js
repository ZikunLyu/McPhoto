const express = require('express');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const artworkController = require('../controllers/artworkController');

const router = express.Router();

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
router.delete('/deleteAll', artworkController.deleteAll);

module.exports = router;
