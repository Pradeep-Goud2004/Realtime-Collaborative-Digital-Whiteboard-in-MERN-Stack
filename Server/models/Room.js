const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roomName: {
    type: String,
    default: 'Untitled Room'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  activeUsers: [{
    userId: String,
    username: String,
    joinedAt: Date
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);





