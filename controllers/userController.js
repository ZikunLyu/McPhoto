const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAUser = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(new AppError('Please provide email to get User object.', 400));
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new AppError('User with specified email does not exist', 401));
  }

  // 3) If everything is ok, send the token to the user
  res.status(200).json({
    status: 'success',
    user
  });
});
