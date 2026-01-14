import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import UserList from './UserList';
import Notepad from './Notepad';
import ShapeEditor from './ShapeEditor';
import Brush from './Brush';
import Chat from './Chat';
import CameraButton from './CameraButton';
import MicrophoneButton from './MicrophoneButton';
import ScreenShareButton from './ScreenShareButton';
import './Whiteboard.css';

const Whiteboard = ({ user, roomId, onLogout }) => {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [brushStyle, setBrushStyle] = useState('soft');
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isShapeEditorOpen, setIsShapeEditorOpen] = useState(false);
  const [isBrushOpen, setIsBrushOpen] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5001', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      
      // Join the room
      newSocket.emit('join-room', {
        roomId,
        username: user.username,
        userId: user.userId
      });
    });

    // Handle user list updates
    newSocket.on('users-updated', (data) => {
      setUsers(data.users);
    });

    // Handle user joined
    newSocket.on('user-joined', (data) => {
      console.log('User joined:', data.username);
    });

    // Handle user left
    newSocket.on('user-left', (data) => {
      console.log('User left:', data.username);
    });

    // Handle whiteboard state (when joining existing room)
    newSocket.on('whiteboard-state', (actions) => {
      if (canvasRef.current) {
        canvasRef.current.loadActions(actions);
      }
    });

    // Handle drawing events from other users
    newSocket.on('draw', (action) => {
      if (canvasRef.current) {
        canvasRef.current.drawRemote(action);
      }
    });

    // Handle erase events from other users
    newSocket.on('erase', (action) => {
      if (canvasRef.current) {
        canvasRef.current.eraseRemote(action);
      }
    });

    // Handle shape events from other users
    newSocket.on('shape', (action) => {
      if (canvasRef.current) {
        canvasRef.current.shapeRemote(action);
      }
    });

    // Handle brush events from other users
    newSocket.on('brush', (action) => {
      if (canvasRef.current) {
        canvasRef.current.brushRemote(action);
      }
    });

    // Handle clear board
    newSocket.on('clear-board', () => {
      if (canvasRef.current) {
        canvasRef.current.clear();
      }
    });

    // Handle user audio toggle events
    newSocket.on('user-audio-toggle', (data) => {
      console.log(`User ${data.username} ${data.enabled ? 'enabled' : 'disabled'} audio`);
      // You can add UI updates here if needed (e.g., show indicator in user list)
    });

    // Handle user video toggle events
    newSocket.on('user-video-toggle', (data) => {
      console.log(`User ${data.username} ${data.enabled ? 'enabled' : 'disabled'} video`);
      // You can add UI updates here if needed (e.g., show indicator in user list)
    });

    // Handle errors
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [roomId, user]);

  const handleDraw = (action) => {
    if (socket) {
      socket.emit('draw', {
        roomId,
        action
      });
    }
  };

  const handleErase = (action) => {
    if (socket) {
      socket.emit('erase', {
        roomId,
        action
      });
    }
  };

  const handleClear = () => {
    if (socket) {
      socket.emit('clear-board', { roomId });
    }
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const handleSave = async () => {
    try {
      // Download the canvas as image
      if (canvasRef.current) {
        canvasRef.current.downloadCanvas();
      }
      
      // Also save to server
      const actions = canvasRef.current?.getActions() || [];
      await axios.post(`http://localhost:5001/api/rooms/${roomId}/whiteboard/save`, {
        actions
      });
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      alert('Failed to save whiteboard');
    }
  };

  const handleNotepadToggle = () => {
    setIsNotepadOpen(!isNotepadOpen);
  };

  const handleShapeToggle = () => {
    setIsShapeEditorOpen(!isShapeEditorOpen);
    // Clear shape state when closing the editor
    if (isShapeEditorOpen && canvasRef.current) {
      canvasRef.current.setShapeState(null);
    }
  };

  const handleShapeSelect = (shapeConfig) => {
    console.log('Shape selected:', shapeConfig);
    if (canvasRef.current) {
      canvasRef.current.setShapeState(shapeConfig);
    }
  };

  const handleShape = (action) => {
    if (socket) {
      socket.emit('shape', {
        roomId,
        action
      });
    }
  };

  const handleBrush = (action) => {
    if (socket) {
      socket.emit('brush', {
        roomId,
        action
      });
    }
  };

  const handleBrushToggle = () => {
    setIsBrushOpen(!isBrushOpen);
  };

  const handleBrushSelect = (brushConfig) => {
    setBrushStyle(brushConfig.brush);
  };

  const handleNotepadSave = (text) => {
    // Add text from notepad directly to canvas
    if (canvasRef.current && text.trim()) {
      try {
        // Get canvas element from ref
        let canvas = null;
        if (canvasRef.current && typeof canvasRef.current.getCanvas === 'function') {
          canvas = canvasRef.current.getCanvas();
        }
        
        if (!canvas) {
          console.warn('Canvas not available');
          return;
        }
        
        // Get canvas dimensions
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw text directly on canvas
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        const fontSize = Math.max(12, strokeWidth * 10);
        ctx.font = `${fontSize}px Arial`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        const lines = text.split('\n');
        lines.forEach((line, index) => {
          ctx.fillText(line || '', centerX, centerY + (index * fontSize * 1.2));
        });
      } catch (error) {
        console.error('Error saving notepad text:', error);
        alert('Failed to add text to whiteboard');
      }
    }
  };

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <div className="header-left">
          <h2>Room: {roomId}</h2>
          <span className="username">Welcome, {user.username}!</span>
        </div>
        <div className="header-right">
          <CameraButton />
          <MicrophoneButton socket={socket} roomId={roomId} user={user} />
          <ScreenShareButton socket={socket} roomId={roomId} user={user} />
          <button className="btn-save" onClick={handleSave}>
            Save Board
          </button>
          <button className="btn-logout" onClick={onLogout}>
            Leave Room
          </button>
        </div>
      </div>

      <div className="whiteboard-content">
        <div className="sidebar">
          <Toolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            onClear={handleClear}
            onNotepadToggle={handleNotepadToggle}
            onShapeToggle={handleShapeToggle}
            onBrushToggle={handleBrushToggle}
          />
          <UserList users={users} currentUser={user} />
        </div>

        <div className="canvas-container">
          <Canvas
            ref={canvasRef}
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            brushStyle={brushStyle}
            onDraw={handleDraw}
            onErase={handleErase}
            onShape={handleShape}
            onBrush={handleBrush}
          />
        </div>

        <div className="chat-sidebar">
          {socket && (
            <Chat 
              socket={socket}
              user={user}
              roomId={roomId}
            />
          )}
        </div>
      </div>

      <Notepad
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
        onSave={handleNotepadSave}
        color={color}
        fontSize={Math.max(12, strokeWidth * 10)}
      />

      <ShapeEditor
        isOpen={isShapeEditorOpen}
        onClose={() => setIsShapeEditorOpen(false)}
        onDrawShape={handleShapeSelect}
        color={color}
        strokeWidth={strokeWidth}
      />

      <Brush
        isOpen={isBrushOpen}
        onClose={() => setIsBrushOpen(false)}
        onBrushSelect={handleBrushSelect}
        color={color}
      />
    </div>
  );
};

export default Whiteboard;





