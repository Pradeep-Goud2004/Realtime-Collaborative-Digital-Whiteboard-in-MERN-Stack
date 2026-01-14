import React, { useState, useRef, useEffect } from 'react';
import './TextEditor.css';

const TextEditor = ({ 
  x, 
  y, 
  initialText = '', 
  color = '#000000', 
  fontSize = 20,
  onSave, 
  onCancel,
  onDelete,
  isEditable = true
}) => {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(initialText === '');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (isEditable && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleMouseDown = (e) => {
    if (!isEditing && isEditable) {
      setIsDragging(true);
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !isEditing) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (onSave && text.trim()) {
          onSave({
            text: text.trim(),
            x: position.x,
            y: position.y,
            color,
            fontSize
          });
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position, text, color, fontSize, onSave, isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Delete' && e.ctrlKey && onDelete) {
      e.preventDefault();
      onDelete();
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSave && text.trim()) {
      onSave({
        text: text.trim(),
        x: position.x,
        y: position.y,
        color,
        fontSize
      });
    } else if (!text.trim() && onCancel) {
      onCancel();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (initialText === '') {
      if (onCancel) onCancel();
    } else {
      setText(initialText);
    }
  };

  const handleBlur = () => {
    // Delay to allow button clicks
    setTimeout(() => {
      if (!isDragging) {
        handleSave();
      }
    }, 200);
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  if (!isEditing && !text.trim()) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`text-editor-container ${isEditing ? 'editing' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        color: color
      }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      {isEditing ? (
        <div className="text-editor-wrapper">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="text-editor-textarea"
            style={{
              fontSize: `${fontSize}px`,
              color: color,
              minHeight: `${Math.max(fontSize * 2, 40)}px`,
              minWidth: `${Math.max(fontSize * 10, 200)}px`
            }}
            placeholder="Type your text here... (Ctrl+Enter to save, Esc to cancel)"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="text-editor-toolbar">
            <button
              className="text-editor-btn save-btn"
              onClick={handleSave}
              title="Save (Ctrl+Enter)"
            >
              ✓
            </button>
            <button
              className="text-editor-btn cancel-btn"
              onClick={handleCancel}
              title="Cancel (Esc)"
            >
              ✕
            </button>
            {onDelete && (
              <button
                className="text-editor-btn delete-btn"
                onClick={onDelete}
                title="Delete (Ctrl+Delete)"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="text-editor-display"
          style={{
            fontSize: `${fontSize}px`,
            color: color,
            cursor: isEditable ? 'move' : 'default'
          }}
        >
          {text.split('\n').map((line, index) => (
            <div key={index}>{line || '\u00A0'}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TextEditor;

