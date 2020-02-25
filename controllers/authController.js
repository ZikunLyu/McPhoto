const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Here when user sign up, only specified info here is exposed to DB.
  // You can tell that we do not provide user to sign up as an admin. To fix, we can either add admin flow or simple create admin by forcily changing the role in the DB manually.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      student: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if the email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // 2) Check if the user exists and the password is correct
  // Since we set in the model that usual get functions won't return user's password, but here we do need the password to be returned, thus we have the .select('+password')
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(
      new AppError('Account does not exist or password is not correct...', 401)
    );
  }

  // 3) If everything is ok, send the token to the user
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});
