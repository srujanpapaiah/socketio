const express = require("express");
const app = express();
const socketio = require("socket.io");

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(8080, () => {
  console.log("listening on port 8080");
});

const io = socketio(expressServer, {
  cors: {
    origin: "http://127.0.0.1:8080",
    methods: ["GET", "POST"],
  },
});
io.of("/").on("connection", (socket) => {
  socket.join("chat");
  // io.of("/").to("chat").emit("welcomeToChatRoom", {});
  io.of("/").to("chat2").emit("welcomeToAdminChatRoom", {});

  console.log(`socketio connected to ${socket.id}`);

  socket.on("message", (data) => {
    console.log(`Message from client: ${data}`);
    io.of("/").emit("message", data);
  });
});

io.of("/admin").on("connection", (socket) => {
  console.log(`socketio connected to Admin id of ${socket.id}`);
  // socket.join("chat");

  io.of("/admin").to("chat").emit("welcomeToChatRoom", {});
});
