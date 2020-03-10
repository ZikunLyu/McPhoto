const express = require('express');
const artworkController = require('../controllers/artworkController');

const router = express.Router();

router.post('/upload', artworkController.upload);
router.delete('/deleteAll', artworkController.deleteAll);

module.exports = router;
