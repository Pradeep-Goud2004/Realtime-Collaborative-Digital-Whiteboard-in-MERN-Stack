const mongoose = require('mongoose');

const sessionRecordingSchema = new mongoose.Schema({
  recordingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  recordingType: {
    type: String,
    enum: ['video', 'audio', 'screen', 'combined'],
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  filePath: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['recording', 'completed', 'failed', 'cancelled'],
    default: 'recording',
    index: true
  },
  participants: [{
    userId: String,
    username: String,
    joinedAt: Date,
    leftAt: Date
  }],
  settings: {
    videoEnabled: {
      type: Boolean,
      default: false
    },
    audioEnabled: {
      type: Boolean,
      default: false
    },
    screenShareEnabled: {
      type: Boolean,
      default: false
    },
    resolution: String,
    frameRate: Number,
    audioQuality: String
  },
  metadata: {
    deviceInfo: String,
    browserInfo: String,
    networkInfo: String
  },
  error: {
    message: String,
    code: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

sessionRecordingSchema.index({ roomId: 1, startTime: -1 });
sessionRecordingSchema.index({ userId: 1, startTime: -1 });
sessionRecordingSchema.index({ status: 1, startTime: -1 });

module.exports = mongoose.model('SessionRecording', sessionRecordingSchema);

