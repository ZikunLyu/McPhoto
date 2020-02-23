const mongoose = require('mongoose');

// example test schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your McGill email!'],
    unique: true,
    lowercase: true, // transfer whatever passed-in to lower case
    validate: {
      validator: function(email) {
        return (
          email.endsWith('@mail.mcgill.ca') || email.endsWith('@mcgill.ca')
        );
      },
      message:
        'Email should be McGill email ending with "@mail.mcgill.ca" or "@mcgill.ca".'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password!'],
  }
});
const User = mongoose.model('User', userSchema); // Student model is created to interact with student table in db

module.exports = User;
