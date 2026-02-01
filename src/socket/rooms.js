const rooms = new Map();

function createRoom(roomId, socketId) {
  if (rooms.has(roomId)) {
    return { error: "Room already exists" };
  }

  rooms.set(roomId, [socketId]);
  return { success: true };
}

function joinRoom(roomId, socketId) {
  if (!rooms.has(roomId)) {
    return { error: "Room does not exist" };
  }

  const users = rooms.get(roomId);

  if (users.length >= 2) {
    return { error: "Room is full" };
  }

  users.push(socketId);
  return { success: true };
}

function leaveRoom(roomId, socketId) {
  if (!rooms.has(roomId)) return;

  const users = rooms.get(roomId).filter(id => id !== socketId);

  if (users.length === 0) {
    rooms.delete(roomId);
  } else {
    rooms.set(roomId, users);
  }
}

function getRoom(roomId) {
  return rooms.get(roomId);
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom
};
