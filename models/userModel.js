const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// You see all of below validators. Indeed we can do validation in frontend.
// However, it is really good to validate here as we can prevent ppl surpassing the validation by simply calling the API not from frontend (eg. postman)
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
    validate: {
      // This validator only works on CREATE and SAVE function in node.js!!
      // Thus won't validate if we use user.findOneAndUpdate() function to talk to DB in code (not talking about api call)
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password are not the same.'
    }
  }
});

userSchema.pre('save', async function(next) {
  // Only run the function only if the password field is modified
  if (!this.isModified('password')) return next();

  // the 2nd param indicates how much compute power to use to generate the hash, the higher the better hash but also longer time to generate, default is 10
  // Since it takes time to generate hash, we use the async version of the hash()
  this.password = await bcrypt.hash(this.password, 12);
  // Delete the passwordConfirm field as it's not encrypted and not needed
  // Note even we set it as required, it does not matter here, as required is for the input, it's not required to save into the DB
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema); // Student model is created to interact with student table in db

module.exports = User;
