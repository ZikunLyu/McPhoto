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
  artwork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArtWork',
    required: [true, 'A transaction must have an artwork']
  },
  status: {
    type: String,
    enum: ['pending', 'finished', 'canceled'],
    default: 'pending'
  },
  msg: String
});
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
