let mongoose = require('mongoose');
let problemSchema = new mongoose.Schema({
  title: String,
  number: Number,
  photoName: String,
  solution: String,
  hint: [ String ],
});

module.exports = mongoose.model('problem_info', problemSchema);
