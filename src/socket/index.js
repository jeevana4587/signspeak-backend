const { Server } = require("socket.io");
const {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom
} = require("./rooms");

function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("join-room", ({ roomId, name }) => {
     let room = getRoom(roomId);
     socket.userName = name;

  if (!room) {
    createRoom(roomId, socket.id);
    socket.join(roomId);
    console.log(`🔥 Room mounted. Host: ${name}`);
    socket.emit("your-role", "caller"); // First person is caller
    return;
  }

  joinRoom(roomId, socket.id);
  socket.join(roomId);
  console.log(`Socket ${socket.id} (${name}) joined room ${roomId}`);
  
  socket.emit("your-role", "callee");
  
  // Tell the Caller (Host) the new Callee's name
  socket.to(roomId).emit("user-connected", { name: name });

  // Tell the new Callee the Caller's (Host's) name
  const otherUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
    .filter(id => id !== socket.id);
  if (otherUsers.length > 0) {
    const hostSocket = io.sockets.sockets.get(otherUsers[0]);
    if (hostSocket && hostSocket.userName) {
      socket.emit("host-name", { name: hostSocket.userName });
    }
  }
  
  // 🟢 CRITICAL: Tell the CALLER to start the offer now that callee is here
  socket.to(roomId).emit("start-offer"); 
});

    // WebRTC signaling
    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    socket.on("leave-room", ({ roomId }) => {
      leaveRoom(roomId, socket.id);
      socket.leave(roomId);
      socket.to(roomId).emit("peer-left");

      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);

      io.sockets.adapter.rooms.forEach((_, roomId) => {
        const users = getRoom(roomId);
        if (users?.includes(socket.id)) {
          leaveRoom(roomId, socket.id);
          socket.to(roomId).emit("peer-left");
        }
      });
    });
  });
}

module.exports = setupSocket;
