const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide your experience title']
  },
  email: {
    type: String,
    required: [true, 'Please provide your McGill email!'],
    lowercase: true
  },
  date: {
    type: Date,
    required: [true, 'Please specify the date of your experience']
  },
  description: {
    type: String,
    required: [true, 'Please give a description']
  }
});

const Experience = mongoose.model('Experience', experienceSchema);

module.exports = Experience;
