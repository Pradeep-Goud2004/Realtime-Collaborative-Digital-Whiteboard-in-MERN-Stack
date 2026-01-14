import React, { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import Whiteboard from './components/Whiteboard';

function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const handleLogin = (userData, roomIdData) => {
    setUser(userData);
    setRoomId(roomIdData);
  };

  const handleLogout = () => {
    setUser(null);
    setRoomId(null);
  };

  return (
    <div className="App">
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Whiteboard user={user} roomId={roomId} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;





