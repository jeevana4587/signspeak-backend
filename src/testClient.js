const { io } = require("socket.io-client");

const ROLE = process.argv[2]; // creator | joiner
const ROOM_ID = "test-room-123";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log(`[${ROLE}] connected as`, socket.id);

  if (ROLE === "creator") {
    socket.emit("create-room", { roomId: ROOM_ID });
  }

  if (ROLE === "joiner") {
    setTimeout(() => {
      socket.emit("join-room", { roomId: ROOM_ID });
    }, 1000);
  }
});

socket.on("room-created", ({ roomId }) => {
  console.log(`[${ROLE}] room created:`, roomId);
});

socket.on("peer-joined", () => {
  console.log(`[${ROLE}] peer joined`);
});

socket.on("room-error", (err) => {
  console.error(`[${ROLE}] room error:`, err);
});
