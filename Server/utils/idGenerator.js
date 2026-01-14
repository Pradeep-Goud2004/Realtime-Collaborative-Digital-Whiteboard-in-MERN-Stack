const crypto = require('crypto');

function generateId(prefix = '') {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(36);
  return prefix ? `${prefix}_${timestamp}_${randomBytes}` : `${timestamp}_${randomBytes}`;
}

function generateFileId() {
  return generateId('file');
}

function generateRecordingId() {
  return generateId('rec');
}

function generateDownloadId() {
  return generateId('dl');
}

function generateLogId() {
  return generateId('log');
}

function generateMessageId() {
  return generateId('msg');
}

module.exports = {
  generateId,
  generateFileId,
  generateRecordingId,
  generateDownloadId,
  generateLogId,
  generateMessageId
};

