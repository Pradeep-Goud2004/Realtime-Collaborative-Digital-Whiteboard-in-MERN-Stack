const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whiteboard')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

// Socket.IO connection handling
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!\n`);
    console.log('To fix this, you can:');
    console.log(`  1. Kill the process using port ${PORT}:`);
    console.log(`     Windows: netstat -ano | findstr :${PORT}`);
    console.log(`     Then: taskkill /PID <PID> /F`);
    console.log(`  2. Use a different port by setting PORT environment variable`);
    console.log(`     Example: PORT=5001 node index.js\n`);
    process.exit(1);
  } else {
    throw err;
  }
});





