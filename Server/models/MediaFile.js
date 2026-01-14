const mongoose = require('mongoose');

const mediaFileSchema = new mongoose.Schema({
  fileId: {
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
  fileType: {
    type: String,
    enum: ['video', 'audio', 'image', 'screenshot', 'whiteboard'],
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: null
  },
  thumbnail: {
    type: String,
    default: null
  },
  metadata: {
    width: Number,
    height: Number,
    resolution: String,
    bitrate: Number,
    codec: String,
    fps: Number,
    sampleRate: Number,
    channels: Number
  },
  description: {
    type: String,
    default: null
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

mediaFileSchema.index({ roomId: 1, uploadedAt: -1 });
mediaFileSchema.index({ userId: 1, uploadedAt: -1 });
mediaFileSchema.index({ fileType: 1, uploadedAt: -1 });
mediaFileSchema.index({ roomId: 1, fileType: 1 });

module.exports = mongoose.model('MediaFile', mediaFileSchema);

