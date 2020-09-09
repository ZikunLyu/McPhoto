const mongoose = require('mongoose');

const artWorkFileSchema = new mongoose.Schema({
  mimetype: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  }
});

module.exports = artWorkFileSchema;
