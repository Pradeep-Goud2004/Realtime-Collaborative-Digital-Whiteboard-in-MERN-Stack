import React, { useState, useRef, useEffect } from 'react';
import './Notepad.css';

const Notepad = ({ isOpen, onClose, onSave, color = '#000000', fontSize = 16 }) => {
  const [text, setText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (onSave && text.trim()) {
      onSave(text);
      setText('');
    }
  };

  const handleClose = () => {
    if (text.trim() && window.confirm('Save text before closing?')) {
      handleSave();
    }
    setText('');
    setIsMinimized(false);
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('Clear all text?')) {
      setText('');
      textareaRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`notepad-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="notepad-header">
        <div className="notepad-title">
          <span>📝</span>
          <span>Notepad</span>
        </div>
        <div className="notepad-controls">
          <button
            className="notepad-btn minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            className="notepad-btn close-btn"
            onClick={handleClose}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="notepad-toolbar">
            <button
              className="notepad-toolbar-btn"
              onClick={handleSave}
              title="Save to Whiteboard (Ctrl+S)"
            >
              💾 Save
            </button>
            <button
              className="notepad-toolbar-btn"
              onClick={handleClear}
              title="Clear All"
            >
              🗑️ Clear
            </button>
            <div className="notepad-info">
              {text.length} characters
            </div>
          </div>
          
          <textarea
            ref={textareaRef}
            className="notepad-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="Type your notes here...&#10;&#10;Press Ctrl+S to save to whiteboard&#10;Press Ctrl+A to select all"
            style={{
              color: color,
              fontSize: `${fontSize}px`,
              lineHeight: '1.6'
            }}
          />
        </>
      )}
    </div>
  );
};

export default Notepad;

