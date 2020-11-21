const mongoose = require('mongoose');

// example test schema
const transactionSchema = new mongoose.Schema({
  sender_email: {
    type: String,
    required: [true, 'A transaction must have a sender email']
  },
  receiver_email: {
    type: String,
    required: [true, 'A transaction must have a receiver email']
  },
  artist: {
    type: String,
    required: [true, 'A transaction must have an artist']
  },
  artwork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtWork',
    required: [true, 'A transaction must have an artwork']
  },
  type: {
    type: String,
    enum: ['Download', 'Rental', 'Sale'],
    required: [true, 'A transaction must have a type']
  },
  status: {
    type: String,
    enum: ['pending', 'finished', 'canceled'],
    default: 'pending'
  },
  artworkTitle: {
    type: String,
    required: [true, 'A transaction must have an artwork title']
  },
  msg: String
});
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
