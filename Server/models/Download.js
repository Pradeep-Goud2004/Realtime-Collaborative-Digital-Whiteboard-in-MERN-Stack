const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  downloadId: {
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
  fileId: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    enum: ['whiteboard', 'image', 'video', 'audio', 'recording'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  downloadTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  downloadMethod: {
    type: String,
    enum: ['browser', 'api', 'manual'],
    default: 'browser'
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  downloadUrl: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

downloadSchema.index({ userId: 1, downloadTime: -1 });
downloadSchema.index({ roomId: 1, downloadTime: -1 });
downloadSchema.index({ fileType: 1, downloadTime: -1 });
downloadSchema.index({ fileId: 1 });

module.exports = mongoose.model('Download', downloadSchema);

