const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const WhiteboardAction = require('../models/WhiteboardAction');
const { validateRoomId } = require('../utils/validation');
const { generateId } = require('../utils/idGenerator');

// Test endpoint to create a simple room
router.get('/test-create', async (req, res) => {
  try {
    console.log('Test create endpoint called');
    const testRoom = new Room({
      roomId: 'test_room_' + Date.now(),
      roomName: 'Test Room',
      activeUsers: []
    });
    const saved = await testRoom.save();
    res.json({ success: true, room: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new room
router.post('/create', async (req, res) => {
  try {
    const { roomName } = req.body;
    
    console.log('Creating room with name:', roomName);
    
    const roomId = generateId('room');
    console.log('Generated roomId:', roomId);
    
    const room = new Room({
      roomId,
      roomName: roomName || 'Untitled Room',
      activeUsers: []
    });
    
    console.log('Saving room:', room);
    
    const savedRoom = await room.save();
    
    console.log('Room saved successfully:', savedRoom);
    
    res.status(201).json({
      success: true,
      room: {
        roomId: savedRoom.roomId,
        roomName: savedRoom.roomName,
        createdAt: savedRoom.createdAt
      }
    });
  } catch (error) {
    console.error('Room creation error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating room: ' + error.message,
      error: error.message
    });
  }
});

// Get room details
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!validateRoomId(roomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room ID format'
      });
    }
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        createdAt: room.createdAt,
        activeUsers: room.activeUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
});

// Get whiteboard data for a room
router.get('/:roomId/whiteboard', async (req, res) => {
  try {
    const { roomId } = req.params;
    const whiteboardData = await WhiteboardAction.findOne({ roomId })
      .sort({ lastUpdated: -1 });
    
    if (!whiteboardData) {
      return res.json({
        success: true,
        actions: []
      });
    }
    
    res.json({
      success: true,
      actions: whiteboardData.actions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching whiteboard data',
      error: error.message
    });
  }
});

// Save whiteboard data
router.post('/:roomId/whiteboard/save', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { actions, imageData } = req.body;
    
    let whiteboardData = await WhiteboardAction.findOne({ roomId });
    
    if (whiteboardData) {
      whiteboardData.actions = actions || whiteboardData.actions;
      whiteboardData.lastUpdated = new Date();
      await whiteboardData.save();
    } else {
      whiteboardData = new WhiteboardAction({
        roomId,
        actions: actions || []
      });
      await whiteboardData.save();
    }
    
    // If image data is provided, save it as a media file
    if (imageData) {
      const MediaFile = require('../models/MediaFile');
      const { generateFileId } = require('../utils/idGenerator');
      const fs = require('fs');
      const path = require('path');
      
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `whiteboard-${roomId}-${Date.now()}.png`;
      const filePath = path.join(uploadDir, fileName);
      
      // Convert base64 to buffer and save
      const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
      
      const mediaFile = new MediaFile({
        fileId: generateFileId(),
        roomId,
        userId: req.body.userId || 'system',
        username: req.body.username || 'system',
        fileType: 'whiteboard',
        fileName: fileName,
        originalFileName: `whiteboard-${roomId}.png`,
        filePath: filePath,
        fileSize: buffer.length,
        mimeType: 'image/png',
        description: 'Whiteboard screenshot'
      });
      await mediaFile.save();
    }
    
    // Update room's lastUpdated timestamp
    await Room.findOneAndUpdate(
      { roomId },
      { lastUpdated: new Date() }
    );
    
    res.json({
      success: true,
      message: 'Whiteboard data saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving whiteboard data',
      error: error.message
    });
  }
});

module.exports = router;

