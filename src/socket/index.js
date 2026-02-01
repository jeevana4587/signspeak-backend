const { Server } = require("socket.io");
const {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom
} = require("./rooms");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // CREATE ROOM
    socket.on("create-room", ({ roomId }) => {
      const result = createRoom(roomId, socket.id);

      if (result.error) {
        socket.emit("room-error", result.error);
        return;
      }

      socket.join(roomId);
      socket.emit("room-created", { roomId });
      console.log(`Room ${roomId} created by ${socket.id}`);
    });

    // JOIN ROOM
    socket.on("join-room", ({ roomId }) => {
      const result = joinRoom(roomId, socket.id);

      if (result.error) {
        socket.emit("room-error", result.error);
        return;
      }

      socket.join(roomId);
      socket.to(roomId).emit("peer-joined", { socketId: socket.id });

      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // WEBRTC SIGNALING
    socket.on("offer", ({ roomId, offer }) => {
       console.log("📨 Offer received");
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      console.log("✅ Answer received");
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      console.log("❄ ICE candidate");
      socket.to(roomId).emit("ice-candidate", candidate);
    });


    // LEAVE ROOM (explicit)
socket.on("leave-room", ({ roomId }) => {
  leaveRoom(roomId, socket.id);
  socket.leave(roomId);
  socket.to(roomId).emit("peer-left");

  console.log(`Socket ${socket.id} left room ${roomId}`);
});


    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);

      // Clean up from any room
      io.sockets.adapter.rooms.forEach((_, roomId) => {
        const users = getRoom(roomId);
        if (users && users.includes(socket.id)) {
          leaveRoom(roomId, socket.id);
          socket.to(roomId).emit("peer-left");
        }
      });
    });
  });
}

module.exports = setupSocket;
