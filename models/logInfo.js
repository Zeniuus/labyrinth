let mongoose = require('mongoose');
let logSchema = new mongoose.Schema({
  id: String,
  log_start: [Date],
  log_end: [Date],
});

module.exports = mongoose.model('log_info', logSchema);
