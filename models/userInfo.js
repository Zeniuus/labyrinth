let mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
  id: String,
  password: String,
  name: String,
  progress: Number,
  last_success: Date,
  timer_start: Date,
});

module.exports = mongoose.model('user_info', userSchema);
