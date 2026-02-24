const express = require("express");
const http = require("http");
const cors = require("cors");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

// 🔥 Place CORS here
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

setupSocket(server);

// 🔥 Bind to 0.0.0.0 for public access
server.listen(5000, "0.0.0.0", () => {
  console.log("SignSpeak backend running on port 5000");
});
