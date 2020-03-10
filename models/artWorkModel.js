const mongoose = require('mongoose');

const artWorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide your artwork name!']
  },
  price: {
    type: Number,
    required: [true, 'Please specify the price']
  },
  description: {
    type: String,
    required: false
  },
  artist: {
    type: String,
    required: [true, 'Please provide artist name']
  },
  creationTime: {
    type: Date,
    required: [true, 'Please provide creation date']
  },
  medium: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    required: true,
    min: 0.0
  },
  height: {
    type: Number,
    required: true,
    min: 0.0
  }
})
artWorkSchema.index({ artist: 1, title: 1 }, { unique: true });
const ArtWork = mongoose.model('ArtWork', artWorkSchema);

module.exports = ArtWork;
