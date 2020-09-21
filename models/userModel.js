const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
      validator: function (email) {
        return (
          email.endsWith('@mail.mcgill.ca') || email.endsWith('@mcgill.ca')
        );
      },
      message:
        'Email should be McGill email ending with "@mail.mcgill.ca" or "@mcgill.ca".'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password!'],
    validate: {
      // This validator only works on CREATE and SAVE function in node.js!!
      // Thus won't validate if we use user.findOneAndUpdate() function to talk to DB in code (not talking about api call)
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same.'
    }
  },
  street: {
    type: String,
    default: "DT Campus"
  },
  region: {
    type: String,
    default: "Montreal, Quebec"
  },
  major: {
    type: String,
    default: "NA"
  },
  // age: {
  //   type: Number,
  //   minimum: 1,
  //   maximum: 200,
  //   default: 18,
  //   description: "must be an integer in [ 1, 200 ]"
  // },
  birthday: {
    type: Number,
    default: 1,

  },
  birthmonth: {

  },
  about: {
    type: String,
    minlength: 8,
    maxlength: 350
  },
  
  passwordLastChanged: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

// Here we encrypt the password
userSchema.pre('save', async function (next) {
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

// Function before saving to DB, update the passwordLastChanged prop, which happens after the resetPassword api is called
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Here we do a small hack of minus 1s. This is to prevent sometimes this passwordLastChanged prop is updated later than the jwt is issued(we issue a new jwt when resetPassword is successful) (Ideally this two time stamps shall be the same)
  this.passwordLastChanged = Date.now() - 1000;
  next();
});

// Instance method: method that is available on all documents of a certain collection (think of it like a JAVA static method)
userSchema.methods.verifyPassword = function (userTypedPassword, realPassword) {
  // can't use this.password cuz we set the "select" to false for the password field. Otherwise we could just call "this.password", as "this" refers to the request returned by the API call that is related to this userSchema
  // ps: it's mongoDB feature that we create this schema here, and then we can access all pieces of data stored in DB corresponding to this schema.
  return bcrypt.compare(userTypedPassword, realPassword);
};

userSchema.methods.passwordChangedAfterTokenIssued = function (jwtTimestamp) {
  if (this.passwordLastChanged) {
    const lastChangedTimestamp = parseInt(
      this.passwordLastChanged.getTime() / 1000,
      10
    );
    return jwtTimestamp < lastChangedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // reset password will expire in the future 10 mins
  return resetToken;
};

const User = mongoose.model('User', userSchema); // Student model is created to interact with student table in db

module.exports = User;
