const express = require('express');
const multer = require('multer');

const upload = multer({ dest: 'uploads/artworkFiles' });
const artworkController = require('../controllers/artworkController');

const router = express.Router();

router.post('/uploadArtInfo', artworkController.uploadArtInfo);
router.post(
  '/uploadFileByTitleArtist',
  upload.single('file'),
  artworkController.uploadArtFileByTitleArtist
);
router.delete('/deleteAll', artworkController.deleteAll);

module.exports = router;
