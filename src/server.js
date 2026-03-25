const express = require("express");
const http = require("http");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

setupSocket(server);

server.listen(5000, () => {
  console.log("SignSpeak backend running on port 5000");
});

const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}));