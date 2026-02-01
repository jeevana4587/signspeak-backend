const {
  createRoom,
  joinRoom,
  getRoom
} = require("./rooms");

console.log("Running room tests...");

console.log(createRoom("room1", "socketA"));
console.log(joinRoom("room1", "socketB"));
console.log(joinRoom("room1", "socketC")); // should fail

console.log("Final room state:", getRoom("room1"));
