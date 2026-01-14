import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = ({ socket, user, roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Load chat history
    socket.on('chat-history', (history) => {
      setMessages(history);
    });

    // Listen for new messages
    socket.on('receive-message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    return () => {
      socket.off('chat-history');
      socket.off('receive-message');
    };
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    // Emit message to server
    socket.emit('send-message', {
      roomId,
      message: newMessage
    });

    // Clear input
    setNewMessage('');
  };

  return (
    <div className={`chat-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="chat-header">
        {isOpen && <h3>💬 Chat</h3>}
        <button 
          className="chat-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Close chat' : 'Open chat'}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.messageId}
                  className={`message ${msg.userId === user.userId ? 'own' : 'other'}`}
                >
                  <div className="message-header">
                    <span className="username">
                      {msg.username}
                      {msg.userId === user.userId && ' (You)'}
                    </span>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="message-content">
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="chat-input"
              autoFocus
            />
            <button 
              type="submit"
              className="chat-send-btn"
              disabled={!newMessage.trim()}
              title="Send message (Enter)"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;
