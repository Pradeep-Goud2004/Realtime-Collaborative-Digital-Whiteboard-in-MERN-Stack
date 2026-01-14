import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import './Canvas.css';

const Canvas = forwardRef(({ tool, color, strokeWidth, onDraw, onErase, onShape, onBrush, brushStyle }, ref) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const actionsRef = useRef([]);
  const shapeStateRef = useRef(null);
  const shapeStartRef = useRef(null);

  const drawBrushStroke = (ctx, prevX, prevY, x, y, brushType) => {
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (brushType) {
      case 'soft':
        ctx.lineWidth = strokeWidth;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      case 'chalky':
        ctx.lineWidth = strokeWidth * 1.2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      case 'marker':
        ctx.lineWidth = strokeWidth * 1.5;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      case 'pencil':
        ctx.lineWidth = strokeWidth * 0.8;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      case 'airbrush':
        ctx.lineWidth = strokeWidth * 2;
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(prevX + (Math.random() - 0.5) * strokeWidth, prevY + (Math.random() - 0.5) * strokeWidth);
          ctx.lineTo(x + (Math.random() - 0.5) * strokeWidth, y + (Math.random() - 0.5) * strokeWidth);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
      case 'watercolor':
        ctx.lineWidth = strokeWidth * 1.3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = strokeWidth * 2;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      default:
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
  };

  const drawShape = (ctx, action) => {
    const { shape, x, y, startX, startY, color: shapeColor, strokeWidth: width, fill, fillColor } = action;
    ctx.strokeStyle = shapeColor || '#000000';
    ctx.lineWidth = width || 2;

    const width_shape = x - startX;
    const height = y - startY;
    const radius = Math.sqrt(width_shape * width_shape + height * height);

    switch (shape) {
      case 'rectangle':
        if (fill && fillColor) {
          ctx.fillStyle = fillColor;
          ctx.fillRect(startX, startY, width_shape, height);
        }
        ctx.strokeRect(startX, startY, width_shape, height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        if (fill && fillColor) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
        break;
      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(startX, startY, Math.abs(width_shape) / 2, Math.abs(height) / 2, 0, 0, 2 * Math.PI);
        if (fill && fillColor) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.lineTo(startX - (x - startX), y);
        ctx.closePath();
        if (fill && fillColor) {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
        break;
      default:
        break;
    }
  };

  const drawAction = useCallback((ctx, action) => {
    if (action.type === 'clear') {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      return;
    }

    if (action.type === 'draw') {
      ctx.strokeStyle = action.color || '#000000';
      ctx.lineWidth = action.strokeWidth || 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.prevX !== undefined && action.prevY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(action.prevX, action.prevY);
        ctx.lineTo(action.x, action.y);
        ctx.stroke();
      }
    } else if (action.type === 'brush') {
      if (action.prevX !== undefined && action.prevY !== undefined) {
        // Temporarily set color for brush drawing
        const originalColor = ctx.strokeStyle;
        ctx.strokeStyle = action.color || '#000000';
        drawBrushStroke(ctx, action.prevX, action.prevY, action.x, action.y, action.brushStyle || 'soft');
        ctx.strokeStyle = originalColor;
      }
    } else if (action.type === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = action.strokeWidth || 20;
      ctx.lineCap = 'round';

      if (action.prevX !== undefined && action.prevY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(action.prevX, action.prevY);
        ctx.lineTo(action.x, action.y);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
    } else if (action.type === 'shape') {
      drawShape(ctx, action);
    }
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    actionsRef.current.forEach((action) => {
      drawAction(ctx, action);
    });
  }, [drawAction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth - 40;
      canvas.height = container.clientHeight - 40;
      
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [redrawCanvas]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const pos = getMousePos(e);
    lastPosRef.current = pos;
    shapeStartRef.current = pos;
    console.log('Start drawing - Shape state:', shapeStateRef.current, 'Position:', pos);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentPos = getMousePos(e);

    // Check tool mode FIRST
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      ctx.globalCompositeOperation = 'source-over';

      const action = {
        type: 'erase',
        x: currentPos.x,
        y: currentPos.y,
        prevX: lastPosRef.current.x,
        prevY: lastPosRef.current.y,
        strokeWidth: strokeWidth * 5,
        timestamp: new Date()
      };

      actionsRef.current.push(action);
      onErase(action);
    } else if (tool === 'brush') {
      drawBrushStroke(ctx, lastPosRef.current.x, lastPosRef.current.y, currentPos.x, currentPos.y, brushStyle || 'soft');

      const action = {
        type: 'brush',
        x: currentPos.x,
        y: currentPos.y,
        prevX: lastPosRef.current.x,
        prevY: lastPosRef.current.y,
        color,
        strokeWidth,
        brushStyle: brushStyle || 'soft',
        timestamp: new Date()
      };

      actionsRef.current.push(action);
      if (onBrush) {
        onBrush(action);
      }
    } else if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();

      const action = {
        type: 'draw',
        x: currentPos.x,
        y: currentPos.y,
        prevX: lastPosRef.current.x,
        prevY: lastPosRef.current.y,
        color,
        strokeWidth,
        timestamp: new Date()
      };

      actionsRef.current.push(action);
      onDraw(action);
    } else if (shapeStateRef.current && shapeStartRef.current) {
      // Draw shape preview - lowest priority
      redrawCanvas();
      const shapeAction = {
        ...shapeStateRef.current,
        startX: shapeStartRef.current.x,
        startY: shapeStartRef.current.y,
        x: currentPos.x,
        y: currentPos.y
      };
      console.log('Drawing shape:', shapeAction);
      drawShape(ctx, shapeAction);
    }

    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    if (shapeStateRef.current && shapeStartRef.current && isDrawingRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const endPos = lastPosRef.current;
        const action = {
          type: 'shape',
          ...shapeStateRef.current,
          startX: shapeStartRef.current.x,
          startY: shapeStartRef.current.y,
          x: endPos.x,
          y: endPos.y,
          timestamp: new Date()
        };

        actionsRef.current.push(action);
        if (onShape) {
          onShape(action);
        }
        shapeStateRef.current = null;
        shapeStartRef.current = null;
      }
    }
    isDrawingRef.current = false;
  };

  useImperativeHandle(ref, () => ({
    drawRemote: (action) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      drawAction(ctx, action);
      actionsRef.current.push(action);
    },
    eraseRemote: (action) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      drawAction(ctx, action);
      actionsRef.current.push(action);
    },
    shapeRemote: (action) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      drawAction(ctx, action);
      actionsRef.current.push(action);
    },
    brushRemote: (action) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      drawAction(ctx, action);
      actionsRef.current.push(action);
    },
    setShapeState: (shapeState) => {
      shapeStateRef.current = shapeState;
    },
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      actionsRef.current = [];
    },
    loadActions: (actions) => {
      actionsRef.current = actions;
      redrawCanvas();
    },
    getActions: () => {
      return actionsRef.current;
    },
    getCanvas: () => {
      return canvasRef.current;
    },
    downloadCanvas: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }));

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="whiteboard-canvas"
        style={{ cursor: 'crosshair' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => {
          e.preventDefault();
          startDrawing(e.touches[0]);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          draw(e.touches[0]);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopDrawing();
        }}
      />
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;





