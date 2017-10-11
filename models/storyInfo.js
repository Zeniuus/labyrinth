let mongoose = require('mongoose');
let storySchema = new mongoose.Schema({
  title: String,
  number: Number,
  imageName: String,
});

module.exports = mongoose.model('story_info', storySchema);
