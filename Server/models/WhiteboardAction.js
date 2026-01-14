const mongoose = require('mongoose');

const whiteboardActionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  actions: [{
    type: {
      type: String,
      enum: ['draw', 'erase', 'clear', 'text'],
      required: true
    },
    x: Number,
    y: Number,
    prevX: Number,
    prevY: Number,
    color: {
      type: String,
      default: '#000000'
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    text: String,
    fontSize: Number,
    textBoxId: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
whiteboardActionSchema.index({ roomId: 1, lastUpdated: -1 });

module.exports = mongoose.model('WhiteboardAction', whiteboardActionSchema);





