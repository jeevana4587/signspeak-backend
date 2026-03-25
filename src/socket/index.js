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

    socket.on("join-room", ({ roomId }) => {
  let room = getRoom(roomId);

  if (!room) {
    createRoom(roomId, socket.id);
    socket.join(roomId);
    console.log("🔥 Room mounted");
    socket.emit("your-role", "caller"); // First person is caller
    return;
  }

  joinRoom(roomId, socket.id);
  socket.join(roomId);
  console.log(`Socket ${socket.id} joined room ${roomId}`);
  
  socket.emit("your-role", "callee"); 
  
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
