const { promisify } = require('util');
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
  // For "passwordConfirm", remember that we don't store it in DB, but the step we set it to undefined is right before saving (at userModel.js pre... where we also encrypt the password), thus here we still need to pass it.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordLastChanged: req.body.passwordLastChanged
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

exports.protect = catchAsync(async (req, res, next) => {
  // 1) When the user makes an API request, the request comes with an header, we check this header (contains token) to see if the user is authorized to make this request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }

  // 2) Verify the token
  // use promisify to quickly getting the promise and then we can use "await" with it
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  // 4) Check if user changed password after token was issued, if changed, throw error
  if (currentUser.passwordChangedAfterTokenIssued(decoded.iat)) {
    return next(
      new AppError('Password recently changed, please log in again.', 401)
    );
  }

  // Grant access to protected route.
  req.user = currentUser;
  next();
  // You can see sometimes we handle the error on the spot(like something is empty), other times eg when function returns a failure status, we handle it in errorController, cuz in that controller we can rewrite the error msg to a more informative one
});
