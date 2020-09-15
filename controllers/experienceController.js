const Experience = require('./../models/experienceModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllExperience = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  if (!email) {
    return next(new AppError('Please login to get experience object.', 400));
  }

  //
  const exper = await Experience.find({ email: email }).exec();
  console.log(exper);

  if (!exper) {
      return next(new AppError('Please check the find one method above', 400));
  }
  
  // 3) If everything is ok, send the token to the user
  res.status(200).json({
    status: 'success',
    exper
  });
});
