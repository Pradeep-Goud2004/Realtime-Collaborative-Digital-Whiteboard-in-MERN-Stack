import React, { useState } from 'react';
import './Brush.css';

const Brush = ({ isOpen, onClose, onBrushSelect, color }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedBrush, setSelectedBrush] = useState('soft');

  const brushStyles = [
    { 
      id: 'soft', 
      label: 'Soft Brush', 
      icon: '🎨',
      description: 'Soft and smooth strokes'
    },
    { 
      id: 'chalky', 
      label: 'Chalky', 
      icon: '✏️',
      description: 'Rough chalk-like texture'
    },
    { 
      id: 'marker', 
      label: 'Marker', 
      icon: '🖍️',
      description: 'Bold marker-like strokes'
    },
    { 
      id: 'pencil', 
      label: 'Pencil', 
      icon: '✍️',
      description: 'Sharp and precise'
    },
    { 
      id: 'airbrush', 
      label: 'Airbrush', 
      icon: '💨',
      description: 'Soft spray effect'
    },
    { 
      id: 'watercolor', 
      label: 'Watercolor', 
      icon: '🌊',
      description: 'Liquid paint effect'
    }
  ];

  const handleBrushSelect = (brushId) => {
    setSelectedBrush(brushId);
    onBrushSelect({
      brush: brushId,
      color
    });
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`brush-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="brush-header">
        <div className="brush-title">
          <span>🎨</span>
          <span>Brush Tool</span>
        </div>
        <div className="brush-controls">
          <button
            className="brush-btn minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            className="brush-btn close-btn"
            onClick={handleClose}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="brush-content">
            <div className="brush-section">
              <label>Select Brush Style</label>
              <div className="brush-grid">
                {brushStyles.map((brush) => (
                  <div
                    key={brush.id}
                    className={`brush-item ${selectedBrush === brush.id ? 'active' : ''}`}
                    onClick={() => handleBrushSelect(brush.id)}
                    title={brush.description}
                  >
                    <div className="brush-icon">{brush.icon}</div>
                    <div className="brush-label">{brush.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="brush-info">
              <p>Select a brush style, then use the pen tool to draw with that brush effect</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Brush;
