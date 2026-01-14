import React, { useState } from 'react';
import './ShapeEditor.css';

const ShapeEditor = ({ isOpen, onClose, onDrawShape, color, strokeWidth }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [fillShape, setFillShape] = useState(false);
  const [fillColor, setFillColor] = useState(color);
  const [isActiveMode, setIsActiveMode] = useState(false);

  const shapes = [
    { id: 'rectangle', label: 'Rectangle', icon: '▭' },
    { id: 'circle', label: 'Circle', icon: '●' },
    { id: 'triangle', label: 'Triangle', icon: '△' },
    { id: 'line', label: 'Line', icon: '╱' },
    { id: 'ellipse', label: 'Ellipse', icon: '⬭' }
  ];

  const handleDrawShape = (shape) => {
    setSelectedShape(shape);
    setIsActiveMode(true);
    onDrawShape({
      shape,
      color,
      strokeWidth,
      fill: fillShape,
      fillColor: fillShape ? fillColor : null
    });
  };

  const handleClose = () => {
    setIsActiveMode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`shape-editor-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="shape-editor-header">
        <div className="shape-editor-title">
          <span>🔷</span>
          <span>Shape Editor</span>
        </div>
        <div className="shape-editor-controls">
          <button
            className="shape-editor-btn minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            className="shape-editor-btn close-btn"
            onClick={handleClose}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="shape-editor-content">
            <div className="shape-section">
              <label>Select Shape</label>
              <div className="shape-buttons">
                {shapes.map((shape) => (
                  <button
                    key={shape.id}
                    className={`shape-btn ${selectedShape === shape.id ? 'active' : ''} ${isActiveMode && selectedShape === shape.id ? 'drawing-mode' : ''}`}
                    onClick={() => handleDrawShape(shape.id)}
                    title={shape.label}
                  >
                    {shape.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="shape-section">
              <label className="fill-checkbox-label">
                <input
                  type="checkbox"
                  checked={fillShape}
                  onChange={(e) => setFillShape(e.target.checked)}
                />
                <span>Fill Shape</span>
              </label>
            </div>

            {fillShape && (
              <div className="shape-section">
                <label>Fill Color</label>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="fill-color-input"
                />
              </div>
            )}

            <div className="shape-info">
              <p>Click and drag on the board to draw the selected shape</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShapeEditor;
