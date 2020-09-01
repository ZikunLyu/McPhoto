const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = (user, res, statusCode) => {
  const token = signToken(user._id);
  // const cookieOptions = {
  //   // set the jwt in cookie also expires as the jwt expires
  //   expires: new Date(
  //     Date.now() + process.env.JWT_EXPIRES_IN * 24 * 3600 * 1000
  //   ),
  //   // so that the cookie cannot be accessed or modified by browser, only by the http request
  //   httpOnly: true
  // };
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Here when user sign up, only specified info here is exposed to DB.
  // You can tell that we do not provide user to sign up as an admin. To fix, we can either add admin flow or simple create admin by forcily changing the role in the DB manually.
  // For "passwordConfirm", remember that we don't store it in DB, but the step we set it to undefined is right before saving (at userModel.js pre... where we also encrypt the password), thus here we still need to pass it.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordLastChanged: req.body.passwordLastChanged
  });

  // const url = 'sdf';
  // await new Email(newUser, url).sendVerification();
  createAndSendToken(newUser, res, 201);
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
  createAndSendToken(user, res, 200);
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

// Middleware function usually does not take argument, thus here we create a normal function taking arg and reutrn a middle function
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return new AppError(
        'You do not have the permission to perform this action.',
        403
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }
  // 2) Generate a random token (not the jwt token)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetUrl).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // 500 means server error
    console.log(err);
    return next(
      new AppError(
        'There was an error sending the email. Please try again later.',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is not valid or has expired.', 400));
  }
  // 3) Update the passwordLastChanged property
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // Here we are updaing the password, we do not use Update() becuz we want the validator to be in use still with save()
  await user.save();

  // 4) Log the user in, send jwt
  createAndSendToken(user, res, 200);
});

exports.updatePassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createAndSendToken(user, res, 200);
});
