const Room = require('../models/Room');
const User = require('../models/User');
const WhiteboardAction = require('../models/WhiteboardAction');
const Login = require('../models/Login');
const SessionRecording = require('../models/SessionRecording');
const ActivityLog = require('../models/ActivityLog');
const ChatMessage = require('../models/ChatMessage');
const { validateRoomId, validateUsername, validateDrawingAction } = require('../utils/validation');
const { generateRecordingId, generateLogId, generateMessageId } = require('../utils/idGenerator');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join-room', async ({ roomId, username, userId }) => {
      try {
        // Validate input
        if (!validateRoomId(roomId) || !validateUsername(username) || !userId) {
          socket.emit('error', { message: 'Invalid room or user data' });
          return;
        }

        socket.join(roomId);
        socket.roomId = roomId;
        socket.username = username;
        socket.userId = userId;

        // Update room's active users
        const room = await Room.findOne({ roomId });
        if (room) {
          const userExists = room.activeUsers.find(u => u.userId === userId);
          if (!userExists) {
            room.activeUsers.push({
              userId,
              username,
              joinedAt: new Date()
            });
            await room.save();
          }
        }

        // Get current whiteboard state
        const whiteboardData = await WhiteboardAction.findOne({ roomId })
          .sort({ lastUpdated: -1 });

        // Send current whiteboard state to the new user
        if (whiteboardData && whiteboardData.actions.length > 0) {
          socket.emit('whiteboard-state', whiteboardData.actions);
        }

        // Load and send chat history to the new user
        const chatMessages = await ChatMessage.find({ roomId })
          .sort({ timestamp: 1 })
          .limit(50);
        
        if (chatMessages.length > 0) {
          socket.emit('chat-history', chatMessages);
        }

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId,
          username,
          timestamp: new Date()
        });

        // Send updated user list to all in room
        const users = await User.find({ roomId });
        io.to(roomId).emit('users-updated', {
          users: users.map(u => ({
            userId: u.userId,
            username: u.username
          }))
        });

        // Log login activity
        const login = new Login({
          userId,
          username,
          roomId,
          loginTime: new Date(),
          isActive: true
        });
        await login.save();

        // Log activity
        const activityLog = new ActivityLog({
          logId: generateLogId(),
          roomId,
          userId,
          username,
          activityType: 'join_room',
          description: `${username} joined room ${roomId}`,
          timestamp: new Date()
        });
        await activityLog.save();

        console.log(`${username} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle drawing events
    socket.on('draw', async (data) => {
      try {
        const { roomId, action } = data;
        
        if (!roomId || !action) {
          return;
        }

        // Validate input
        if (!validateRoomId(roomId) || !validateDrawingAction(action)) {
          socket.emit('error', { message: 'Invalid drawing data' });
          return;
        }

        // Broadcast to all users in the room except sender
        socket.to(roomId).emit('draw', action);

        // Save to database
        let whiteboardData = await WhiteboardAction.findOne({ roomId });
        
        if (whiteboardData) {
          whiteboardData.actions.push(action);
          whiteboardData.lastUpdated = new Date();
        } else {
          whiteboardData = new WhiteboardAction({
            roomId,
            actions: [action]
          });
        }
        
        await whiteboardData.save();

        // Update room's lastUpdated
        await Room.findOneAndUpdate(
          { roomId },
          { lastUpdated: new Date() }
        );
      } catch (error) {
        console.error('Error handling draw event:', error);
        socket.emit('error', { message: 'Failed to process drawing' });
      }
    });

    // Handle erase events
    socket.on('erase', async (data) => {
      try {
        const { roomId, action } = data;
        
        if (!roomId || !action) {
          return;
        }

        // Validate input
        if (!validateRoomId(roomId) || !validateDrawingAction(action)) {
          socket.emit('error', { message: 'Invalid erase data' });
          return;
        }

        // Broadcast erase action
        socket.to(roomId).emit('erase', action);

        // Save to database
        let whiteboardData = await WhiteboardAction.findOne({ roomId });
        
        if (whiteboardData) {
          whiteboardData.actions.push(action);
          whiteboardData.lastUpdated = new Date();
        } else {
          whiteboardData = new WhiteboardAction({
            roomId,
            actions: [action]
          });
        }
        
        await whiteboardData.save();
      } catch (error) {
        console.error('Error handling erase event:', error);
        socket.emit('error', { message: 'Failed to process erase' });
      }
    });

    // Handle shape events
    socket.on('shape', async (data) => {
      try {
        const { roomId, action } = data;
        
        if (!roomId || !action) {
          return;
        }

        // Validate input
        if (!validateRoomId(roomId)) {
          socket.emit('error', { message: 'Invalid room data' });
          return;
        }

        // Broadcast shape action
        socket.to(roomId).emit('shape', action);

        // Save to database
        let whiteboardData = await WhiteboardAction.findOne({ roomId });
        
        if (whiteboardData) {
          whiteboardData.actions.push(action);
          whiteboardData.lastUpdated = new Date();
        } else {
          whiteboardData = new WhiteboardAction({
            roomId,
            actions: [action]
          });
        }
        
        await whiteboardData.save();

        // Update room's lastUpdated
        await Room.findOneAndUpdate(
          { roomId },
          { lastUpdated: new Date() }
        );
      } catch (error) {
        console.error('Error handling shape event:', error);
        socket.emit('error', { message: 'Failed to process shape' });
      }
    });

    // Handle clear board
    socket.on('clear-board', async (data) => {
      try {
        const { roomId } = data;
        
        if (!roomId || !validateRoomId(roomId)) {
          return;
        }

        // Broadcast clear action
        socket.to(roomId).emit('clear-board');

        // Clear database
        await WhiteboardAction.findOneAndUpdate(
          { roomId },
          { actions: [], lastUpdated: new Date() },
          { upsert: true }
        );

        // Log activity
        const activityLog = new ActivityLog({
          logId: generateLogId(),
          roomId,
          userId: socket.userId,
          username: socket.username,
          activityType: 'clear_board',
          description: `${socket.username} cleared the board`,
          timestamp: new Date()
        });
        await activityLog.save();
      } catch (error) {
        console.error('Error handling clear board:', error);
        socket.emit('error', { message: 'Failed to clear board' });
      }
    });

    // Handle video toggle
    socket.on('video-toggle', async (data) => {
      try {
        const { roomId, userId, username, enabled } = data;
        
        if (!roomId || !validateRoomId(roomId)) {
          return;
        }

        // Broadcast to room
        socket.to(roomId).emit('user-video-toggle', {
          userId,
          username,
          enabled
        });

        // Log activity
        const activityLog = new ActivityLog({
          logId: generateLogId(),
          roomId,
          userId,
          username,
          activityType: enabled ? 'enable_video' : 'disable_video',
          description: `${username} ${enabled ? 'enabled' : 'disabled'} video`,
          timestamp: new Date()
        });
        await activityLog.save();
      } catch (error) {
        console.error('Error handling video toggle:', error);
      }
    });

    // Handle audio toggle
    socket.on('audio-toggle', async (data) => {
      try {
        const { roomId, userId, username, enabled } = data;
        
        if (!roomId || !validateRoomId(roomId)) {
          return;
        }

        // Broadcast to room
        socket.to(roomId).emit('user-audio-toggle', {
          userId,
          username,
          enabled
        });

        // Log activity
        const activityLog = new ActivityLog({
          logId: generateLogId(),
          roomId,
          userId,
          username,
          activityType: enabled ? 'enable_audio' : 'disable_audio',
          description: `${username} ${enabled ? 'enabled' : 'disabled'} audio`,
          timestamp: new Date()
        });
        await activityLog.save();
      } catch (error) {
        console.error('Error handling audio toggle:', error);
      }
    });

    // Handle screen share start
    socket.on('screen-share-start', async (data) => {
      try {
        const { roomId, userId, username } = data;
        
        if (!roomId || !validateRoomId(roomId)) {
          return;
        }

        // Create recording session
        const recording = new SessionRecording({
          recordingId: generateRecordingId(),
          roomId,
          userId,
          username,
          recordingType: 'screen',
          startTime: new Date(),
          status: 'recording',
          settings: {
            screenShareEnabled: true
          }
        });
        await recording.save();

        // Broadcast to room
        socket.to(roomId).emit('user-screen-share', {
          userId,
          username,
          recordingId: recording.recordingId
        });

        // Log activity
        const activityLog = new ActivityLog({
          logId: generateLogId(),
          roomId,
          userId,
          username,
          activityType: 'screen_share',
          description: `${username} started screen sharing`,
          metadata: { recordingId: recording.recordingId },
          timestamp: new Date()
        });
        await activityLog.save();
      } catch (error) {
        console.error('Error handling screen share start:', error);
      }
    });

    // Handle screen share stop
    socket.on('screen-share-stop', async (data) => {
      try {
        const { roomId, userId, username } = data;
        
        if (!roomId || !validateRoomId(roomId)) {
          return;
        }

        // Update recording session
        const recording = await SessionRecording.findOne({
          roomId,
          userId,
          status: 'recording',
          recordingType: 'screen'
        }).sort({ startTime: -1 });

        if (recording) {
          recording.endTime = new Date();
          recording.duration = Math.floor((recording.endTime - recording.startTime) / 1000);
          recording.status = 'completed';
          await recording.save();
        }

        // Broadcast to room
        socket.to(roomId).emit('user-stopped-sharing', {
          userId,
          username
        });

        // Log activity
        const activityLog = new ActivityLog({
          logId: generateLogId(),
          roomId,
          userId,
          username,
          activityType: 'screen_share',
          description: `${username} stopped screen sharing`,
          timestamp: new Date()
        });
        await activityLog.save();
      } catch (error) {
        console.error('Error handling screen share stop:', error);
      }
    });

    // Handle chat messages
    socket.on('send-message', async (data) => {
      try {
        const { roomId, message } = data;
        
        if (!roomId || !message || !socket.userId || !socket.username) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Validate room
        if (!validateRoomId(roomId)) {
          socket.emit('error', { message: 'Invalid room ID' });
          return;
        }

        // Create and save chat message
        const chatMessage = new ChatMessage({
          messageId: generateMessageId(),
          roomId,
          userId: socket.userId,
          username: socket.username,
          message: message.trim(),
          timestamp: new Date()
        });

        await chatMessage.save();

        // Broadcast message to all users in the room
        io.to(roomId).emit('receive-message', {
          messageId: chatMessage.messageId,
          userId: chatMessage.userId,
          username: chatMessage.username,
          message: chatMessage.message,
          timestamp: chatMessage.timestamp
        });

        console.log(`Message from ${socket.username} in room ${roomId}: ${message}`);
      } catch (error) {
        console.error('Error handling chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.roomId && socket.userId) {
          // Update login record
          const login = await Login.findOne({
            userId: socket.userId,
            roomId: socket.roomId,
            isActive: true
          }).sort({ loginTime: -1 });

          if (login) {
            login.logoutTime = new Date();
            login.sessionDuration = Math.floor((login.logoutTime - login.loginTime) / 1000);
            login.isActive = false;
            await login.save();
          }

          // Stop any active recordings
          await SessionRecording.updateMany(
            {
              roomId: socket.roomId,
              userId: socket.userId,
              status: 'recording'
            },
            {
              endTime: new Date(),
              status: 'completed'
            }
          );

          // Remove user from room's active users
          const room = await Room.findOne({ roomId: socket.roomId });
          if (room) {
            room.activeUsers = room.activeUsers.filter(
              u => u.userId !== socket.userId
            );
            await room.save();
          }

          // Notify others
          socket.to(socket.roomId).emit('user-left', {
            userId: socket.userId,
            username: socket.username,
            timestamp: new Date()
          });

          // Update user list
          const users = await User.find({ roomId: socket.roomId });
          io.to(socket.roomId).emit('users-updated', {
            users: users.map(u => ({
              userId: u.userId,
              username: u.username
            }))
          });

          // Log activity
          const activityLog = new ActivityLog({
            logId: generateLogId(),
            roomId: socket.roomId,
            userId: socket.userId,
            username: socket.username,
            activityType: 'leave_room',
            description: `${socket.username} left room ${socket.roomId}`,
            timestamp: new Date()
          });
          await activityLog.save();

          console.log(`${socket.username} left room ${socket.roomId}`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};
