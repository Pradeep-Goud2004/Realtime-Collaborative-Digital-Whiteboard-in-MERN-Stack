import React from 'react';
import './Toolbar.css';

const Toolbar = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onClear,
  onNotepadToggle,
  onShapeToggle,
  onBrushToggle
}) => {
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  return (
    <div className="toolbar">
      <h3>Tools</h3>
      
      <div className="tool-section">
        <label>Tool</label>
        <div className="tool-buttons">
          <button
            className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            ✏️
          </button>
          <button
            className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
            onClick={() => setTool('brush')}
            title="Brush"
          >
            🎨
          </button>
          <button
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            🧹
          </button>
        </div>
      </div>

      {tool === 'pen' && (
        <>
          <div className="tool-section">
            <label>Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
              />
              <div className="color-palette">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={`color-btn ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="tool-section">
            <label>Stroke Width: {strokeWidth}px</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="slider"
            />
          </div>
        </>
      )}

      {tool === 'brush' && (
        <>
          <div className="tool-section">
            <label>Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
              />
              <div className="color-palette">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={`color-btn ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="tool-section">
            <label>Brush Size: {strokeWidth}px</label>
            <input
              type="range"
              min="1"
              max="30"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <div className="tool-section">
            <button 
              className="brush-styles-btn" 
              onClick={onBrushToggle}
              title="Open Brush Styles"
            >
              🎨 Brush Styles
            </button>
          </div>
        </>
      )}

      <div className="tool-section">
        <button className="clear-btn" onClick={onClear}>
          Clear Board
        </button>
      </div>

      <div className="tool-section">
        <button 
          className="notepad-toggle-btn" 
          onClick={onNotepadToggle}
          title="Open Notepad"
        >
          📝 Notepad
        </button>
      </div>

      <div className="tool-section">
        <button 
          className="shape-toggle-btn" 
          onClick={onShapeToggle}
          title="Open Shape Editor"
        >
          🔷 Shapes
        </button>
      </div>
    </div>
  );
};

export default Toolbar;





