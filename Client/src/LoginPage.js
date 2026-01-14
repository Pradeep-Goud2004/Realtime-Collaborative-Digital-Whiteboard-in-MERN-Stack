import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      const response = await axios.post('http://localhost:5001/api/rooms/create', {
        roomName: `${username}'s Room`
      });

      if (!response.data.success || !response.data.room) {
        setError('Failed to create room. Please try again.');
        setIsCreating(false);
        return;
      }

      const newRoomId = response.data.room.roomId;
      
      // Join the room
      const joinResponse = await axios.post('http://localhost:5001/api/users/join', {
        username: username.trim(),
        roomId: newRoomId
      });

      if (!joinResponse.data.success) {
        setError('Room created but failed to join. Please try joining manually.');
        setIsCreating(false);
        return;
      }

      onLogin(joinResponse.data.user, newRoomId);
    } catch (err) {
      console.error('Create room full error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError(err.response?.data?.message || 'Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomId.trim()) {
      setError('Please enter your name and room ID');
      return;
    }

    try {
      setIsCreating(true);
      setError('');

      // Check if room exists
      try {
        await axios.get(`http://localhost:5001/api/rooms/${roomId.trim()}`);
      } catch (roomCheckErr) {
        if (roomCheckErr.response?.status === 404) {
          setError('Room not found. Please check the room ID or create a new room.');
          setIsCreating(false);
          return;
        }
        throw roomCheckErr;
      }

      // Join the room
      const joinResponse = await axios.post('http://localhost:5001/api/users/join', {
        username: username.trim(),
        roomId: roomId.trim()
      });

      onLogin(joinResponse.data.user, roomId.trim());
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Room not found. Please check the room ID or create a new room.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid input. Please check your details.');
      } else {
        setError(err.response?.data?.message || 'Failed to join room. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Collaborative Whiteboard</h1>
        <p className="subtitle">Real-time collaboration for teams</p>
        
        <div className="login-form">
          <div className="input-group">
            <label htmlFor="username">Your Name</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="input-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              placeholder="Enter room ID to join"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleCreateRoom}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create New Room'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleJoinRoom}
              disabled={isCreating}
            >
              {isCreating ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;





