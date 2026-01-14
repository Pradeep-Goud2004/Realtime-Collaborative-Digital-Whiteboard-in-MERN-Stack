const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  logId: {
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
  activityType: {
    type: String,
    enum: [
      'login', 'logout', 'join_room', 'leave_room',
      'draw', 'erase', 'clear_board', 'save_board',
      'upload_file', 'download_file', 'start_recording',
      'stop_recording', 'enable_video', 'disable_video',
      'enable_audio', 'disable_audio', 'screen_share',
      'create_room', 'delete_room'
    ],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

activityLogSchema.index({ roomId: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ activityType: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

