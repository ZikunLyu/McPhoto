const mongoose = require('mongoose');
const ArtWorkFile = require('./artWorkFileModel');

const artWorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide your artwork name!']
  },
  rental_price: {
    type: Number,
    default: 0
  },
  download_price: {
    type: Number,
    default: 0
  },
  sale_price: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: false
  },
  artist: {
    type: String,
    required: [true, 'Please provide artist name']
  },
  artistEmail: {
    type: String,
    required: [true, 'Please provide artist email']
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
    //required: [true, 'Please upload the photo of your artwork!']
  },
  accessList: [String],
  ccLicense: {
    type: String,
    enum: [
      'N/A',
      'CC-BY-NC-ND',
      'CC-BY-NC-SA',
      'CC-BY-NC',
      'CC-BY-ND',
      'CC-BY-SA',
      'CC-BY',
      'CC0'
    ],
    default: 'N/A'
  }
  //index created on {artist, title}
});
artWorkSchema.index({ artist: 1, title: 1 }, { unique: true });
const ArtWork = mongoose.model('ArtWork', artWorkSchema);

module.exports = ArtWork;
