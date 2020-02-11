const Student = require('./../models/testModel');

exports.createStudent = async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        student: newStudent
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
