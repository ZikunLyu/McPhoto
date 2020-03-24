const mongoose = require('mongoose');
const ArtWorkFile = require('./artWorkFileModel')

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
  },
  isForDownload: {
    type: Boolean,
    default: false
  },
  isForSale: {
    type: Boolean,
    default: false
  },
  isForRental: {
    type: Boolean,
    default: true
  },
  isSoldorRented: {
    type: Boolean,
    default: false
  },
  isPictureUpload: {
    type: Boolean,
    default: false
  },
  artworkfile: {
    type: ArtWorkFile
  }
})
artWorkSchema.index({ artist: 1, title: 1 }, { unique: true });
const ArtWork = mongoose.model('ArtWork', artWorkSchema);

module.exports = ArtWork;
