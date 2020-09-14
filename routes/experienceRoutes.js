const express = require('express');
const experienceController = require('../controllers/experienceController');

const router = express.Router();

router.get('/getAllExperience', experienceController.getAllExperience);

module.exports = router;
