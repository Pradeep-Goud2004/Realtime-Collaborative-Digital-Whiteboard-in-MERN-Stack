// Input validation utilities

const validateRoomId = (roomId) => {
  if (!roomId || typeof roomId !== 'string') {
    return false;
  }
  // Room ID can be: alphanumeric with underscores, min 5 characters
  // Accepts both generated format (timestamp_hexstring) and user-entered formats
  return /^[a-zA-Z0-9_-]{5,}$/.test(roomId);
};

const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return false;
  }
  // Username should be 1-30 characters, alphanumeric and spaces
  const trimmed = username.trim();
  return trimmed.length >= 1 && trimmed.length <= 30 && /^[a-zA-Z0-9\s]+$/.test(trimmed);
};

const validateDrawingAction = (action) => {
  if (!action || typeof action !== 'object') {
    return false;
  }

  const { type, x, y } = action;

  if (!type || !['draw', 'erase', 'clear'].includes(type)) {
    return false;
  }

  if (type === 'clear') {
    return true;
  }

  if (typeof x !== 'number' || typeof y !== 'number') {
    return false;
  }

  if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
    return false;
  }

  // Validate color if present
  if (action.color && typeof action.color !== 'string') {
    return false;
  }

  // Validate strokeWidth if present
  if (action.strokeWidth !== undefined) {
    if (typeof action.strokeWidth !== 'number' || action.strokeWidth < 0 || action.strokeWidth > 100) {
      return false;
    }
  }

  return true;
};

module.exports = {
  validateRoomId,
  validateUsername,
  validateDrawingAction
};





