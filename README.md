# Real-Time Collaborative Digital Whiteboard

A web-based collaborative whiteboard application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.IO for real-time synchronization.

## Features

- **Real-Time Collaboration**: Multiple users can draw simultaneously on a shared canvas
- **Room Management**: Create or join whiteboard rooms with unique room IDs
- **Drawing Tools**: 
  - Freehand drawing with customizable colors and stroke width
  - Eraser tool
  - Clear board functionality
- **User Management**: See who's online in your room
- **Data Persistence**: Save and reload whiteboard sessions
- **Responsive Design**: Works on desktop and tablet devices

## Technology Stack

- **Frontend**: React.js, HTML5 Canvas, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB
- **Real-Time Communication**: WebSockets via Socket.IO

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-whiteboard
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

Or install all dependencies at once:
```bash
npm run install-all
```

4. Set up environment variables:
Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whiteboard
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
```

5. Start MongoDB:
Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in `.env`.

## Running the Application

### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run them separately:

**Terminal 1 - Server:**
```bash
npm run server
```

**Terminal 2 - Client:**
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Create a Room**:
   - Enter your name
   - Click "Create New Room"
   - Share the Room ID with others

2. **Join a Room**:
   - Enter your name
   - Enter the Room ID
   - Click "Join Room"

3. **Drawing**:
   - Select the pen tool
   - Choose a color and stroke width
   - Start drawing on the canvas

4. **Erasing**:
   - Select the eraser tool
   - Erase parts of the drawing

5. **Saving**:
   - Click "Save Board" to persist the current state
   - The board state will be automatically loaded when you rejoin

## Project Structure

```
digital-whiteboard/
├── server/
│   ├── index.js              # Main server file
│   ├── models/               # MongoDB models
│   │   ├── Room.js
│   │   ├── User.js
│   │   └── WhiteboardAction.js
│   ├── routes/               # API routes
│   │   ├── roomRoutes.js
│   │   └── userRoutes.js
│   └── socket/               # Socket.IO handlers
│       └── socketHandler.js
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.js
│   │   │   ├── Whiteboard.js
│   │   │   ├── Canvas.js
│   │   │   ├── Toolbar.js
│   │   │   └── UserList.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

## API Endpoints

### Rooms
- `POST /api/rooms/create` - Create a new room
- `GET /api/rooms/:roomId` - Get room details
- `GET /api/rooms/:roomId/whiteboard` - Get whiteboard data
- `POST /api/rooms/:roomId/whiteboard/save` - Save whiteboard data

### Users
- `POST /api/users/join` - Join a room
- `GET /api/users/room/:roomId` - Get users in a room

## Socket.IO Events

### Client to Server
- `join-room` - Join a whiteboard room
- `draw` - Send drawing action
- `erase` - Send erase action
- `clear-board` - Clear the board

### Server to Client
- `whiteboard-state` - Initial board state when joining
- `draw` - Receive drawing action from another user
- `erase` - Receive erase action from another user
- `clear-board` - Board cleared notification
- `user-joined` - User joined the room
- `user-left` - User left the room
- `users-updated` - Updated user list

## Security Considerations

- Input validation on both client and server
- Secure Socket.IO connections
- Room-based access control
- Data sanitization before storage

## Limitations

- Requires stable internet connection
- Supports small groups (optimized for 5-10 concurrent users)
- No video/audio communication
- Limited drawing tools (pen and eraser only)

## Future Enhancements

- Undo/Redo functionality
- Text tool
- Shape tools (rectangle, circle, line)
- Export whiteboard as image/PDF
- Mobile app support
- Voice and video conferencing
- AI-based handwriting recognition
- User authentication and authorization

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.





