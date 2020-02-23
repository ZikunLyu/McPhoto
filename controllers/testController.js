const Student = require('./../models/testModel');
const catchAsync = require('./../utils/catchAsync');

exports.createStudent = catchAsync(async (req, res, next) => {
  const newStudent = await Student.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      student: newStudent
    }
  });
});
