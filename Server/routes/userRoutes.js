const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const { validateRoomId, validateUsername } = require('../utils/validation');
const { generateId } = require('../utils/idGenerator');

// Join a room
router.post('/join', async (req, res) => {
  try {
    const { username, roomId } = req.body;
    
    console.log('Join request received:', { username, roomId });
    
    if (!username || !roomId) {
      console.log('Missing username or roomId');
      return res.status(400).json({
        success: false,
        message: 'Username and roomId are required'
      });
    }

    // Validate input
    const usernameValid = validateUsername(username);
    const roomIdValid = validateRoomId(roomId);
    
    console.log('Validation results:', { usernameValid, roomIdValid });
    
    if (!usernameValid || !roomIdValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid username or room ID format'
      });
    }
    
    // Check if room exists
    console.log('Checking if room exists:', roomId);
    const room = await Room.findOne({ roomId });
    console.log('Room found:', !!room);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const userId = generateId('user');
    console.log('Generated userId:', userId);
    
    // Create user session and store in database
    const user = new User({
      userId,
      username,
      roomId
    });
    
    console.log('Saving user:', user);
    await user.save();
    console.log('User saved successfully');
    
    // Update room's activeUsers list
    console.log('Updating room activeUsers');
    await Room.findOneAndUpdate(
      { roomId },
      {
        $push: {
          activeUsers: {
            userId,
            username,
            joinedAt: new Date()
          }
        },
        lastUpdated: new Date()
      },
      { new: true }
    );
    console.log('Room updated successfully');
    
    res.json({
      success: true,
      user: {
        userId,
        username,
        roomId
      }
    });
  } catch (error) {
    console.error('User join error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error joining room',
      error: error.message
    });
  }
});

// Get users in a room
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const users = await User.find({ roomId });
    
    res.json({
      success: true,
      users: users.map(user => ({
        userId: user.userId,
        username: user.username,
        joinedAt: user.joinedAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

module.exports = router;

