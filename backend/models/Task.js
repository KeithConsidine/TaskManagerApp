// schema for tsaks

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  resourceLink: String,
  tags: [String],
  visibility: { type: String, enum: ['private', 'group', 'public'], default: 'private' },
  completed: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
});

module.exports = mongoose.model('Task', TaskSchema);
