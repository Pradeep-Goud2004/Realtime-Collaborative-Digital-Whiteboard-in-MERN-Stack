const express = require('express');
const router = express.Router();
const MediaFile = require('../models/MediaFile');
const Download = require('../models/Download');
const SessionRecording = require('../models/SessionRecording');
const { generateFileId, generateDownloadId } = require('../utils/idGenerator');
const path = require('path');
const fs = require('fs');

// Try to use multer if available, otherwise handle uploads differently
let multer, upload;
try {
  multer = require('multer');
  
  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({
    storage: storage,
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB limit
    }
  });
} catch (error) {
  console.warn('Multer not installed. File uploads will be limited.');
}

// Upload media file
router.post('/upload', upload ? upload.single('file') : (req, res, next) => {
  res.status(503).json({ success: false, message: 'File upload requires multer package. Install with: npm install multer' });
}, async (req, res) => {
  try {
    const { roomId, userId, username, fileType, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const mediaFile = new MediaFile({
      fileId: generateFileId(),
      roomId,
      userId,
      username,
      fileType: fileType || 'image',
      fileName: file.filename,
      originalFileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      description: description || null
    });

    await mediaFile.save();

    res.json({
      success: true,
      file: {
        fileId: mediaFile.fileId,
        fileName: mediaFile.fileName,
        fileType: mediaFile.fileType,
        fileSize: mediaFile.fileSize
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Get media files for a room
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { fileType } = req.query;

    const query = { roomId };
    if (fileType) {
      query.fileType = fileType;
    }

    const files = await MediaFile.find(query)
      .sort({ uploadedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      files: files.map(f => ({
        fileId: f.fileId,
        fileName: f.fileName,
        originalFileName: f.originalFileName,
        fileType: f.fileType,
        fileSize: f.fileSize,
        uploadedAt: f.uploadedAt,
        username: f.username
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching files',
      error: error.message
    });
  }
});

// Download file
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId, username, roomId } = req.query;

    const file = await MediaFile.findOne({ fileId });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Record download
    const download = new Download({
      downloadId: generateDownloadId(),
      roomId: file.roomId,
      userId: userId || 'anonymous',
      username: username || 'anonymous',
      fileId: file.fileId,
      fileType: file.fileType,
      fileName: file.originalFileName,
      fileSize: file.fileSize,
      downloadMethod: 'api',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    await download.save();

    // Update download count
    file.downloadCount += 1;
    await file.save();

    res.download(file.filePath, file.originalFileName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
});

// Get download history
router.get('/downloads/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.query;

    const query = { roomId };
    if (userId) {
      query.userId = userId;
    }

    const downloads = await Download.find(query)
      .sort({ downloadTime: -1 })
      .limit(100);

    res.json({
      success: true,
      downloads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching downloads',
      error: error.message
    });
  }
});

// Get session recordings
router.get('/recordings/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, status } = req.query;

    const query = { roomId };
    if (userId) {
      query.userId = userId;
    }
    if (status) {
      query.status = status;
    }

    const recordings = await SessionRecording.find(query)
      .sort({ startTime: -1 })
      .limit(50);

    res.json({
      success: true,
      recordings: recordings.map(r => ({
        recordingId: r.recordingId,
        userId: r.userId,
        username: r.username,
        recordingType: r.recordingType,
        startTime: r.startTime,
        endTime: r.endTime,
        duration: r.duration,
        status: r.status,
        fileSize: r.fileSize
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recordings',
      error: error.message
    });
  }
});

module.exports = router;

