const mongoose = require('mongoose');

// example test schema
const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A student must have a name']
    // unique: true
  },
  id: {
    type: Number,
    default: 260000000
  },
  msg: String
});
const Student = mongoose.model('Student', testSchema); // Student model is created to interact with student table in db

module.exports = Student;

// example create an instance to the db from code
// const testStudent = new Student({
//     name: "Charles",
//     id: 260123456
// })

// testStudent.save().then(doc => {
//     console.log(doc)
// }).catch(err => {
//     console.log("###Error: ", err);
// })
