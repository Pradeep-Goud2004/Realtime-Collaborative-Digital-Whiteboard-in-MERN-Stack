const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  loginTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  logoutTime: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  sessionDuration: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

loginSchema.index({ userId: 1, loginTime: -1 });
loginSchema.index({ roomId: 1, loginTime: -1 });
loginSchema.index({ isActive: 1 });

module.exports = mongoose.model('Login', loginSchema);

