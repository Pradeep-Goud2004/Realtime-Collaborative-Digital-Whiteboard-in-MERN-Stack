# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI if needed (default: `mongodb://localhost:27017/whiteboard`)

3. **Start MongoDB**
   - Make sure MongoDB is running locally, or
   - Use MongoDB Atlas and update `MONGODB_URI` in `.env`

4. **Run the Application**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open http://localhost:3000 in your browser
   - Create a room or join an existing one

## MongoDB Setup

### Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whiteboard
   ```

## Troubleshooting

### Port Already in Use
- Change `PORT` in `.env` (default: 5000)
- Change React port by setting `PORT=3001` in `client/.env`

### MongoDB Connection Error
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure network access is allowed (for Atlas)

### Socket.IO Connection Issues
- Check CORS settings in `server/index.js`
- Verify `CLIENT_URL` in `.env` matches your frontend URL
- Check firewall settings

## Development

### Running Separately
- **Backend only**: `npm run server`
- **Frontend only**: `npm run client`

### Building for Production
```bash
cd client
npm run build
```

The production build will be in `client/build/`





