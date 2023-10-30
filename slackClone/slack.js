const express = require("express");
const app = express();
const socketio = require("socket.io");

const namespaces = require("./data/namespaces");
const Room = require("./classes/Room");

app.use(express.static(__dirname + "/public"));

const expressServer = app.listen(9002, () => {
  console.log("listening on port 9002");
});

const io = socketio(expressServer, {
  cors: {
    origin: "http://127.0.0.1:9002",
    methods: ["GET", "POST"],
  },
});

app.get("/change-ns", (req, res) => {
  //update namespaces array
  namespaces[0].addRoom(new Room(0, "Deleted Articles", 0));
  //let everyone know in THIS namespace, that it changed.
  io.of(namespaces[0].endpoint).emit("nsChange", namespaces[0]);
  res.json(namespaces[0]);
});

io.on("connection", (socket) => {
  socket.emit("welcome", "welcome to the server");
  socket.on("clientConnect", (data) => {
    console.log(socket.id, "has connected");
    socket.emit("nsList", namespaces);
  });
});

namespaces.forEach((namespace) => {
  io.of(namespace.endpoint).on("connection", (socket) => {
    socket.on("joinRoom", async (roomTitle, ackCallBack) => {
      // leave all rooms(except own room), because the client can only be in one room
      const rooms = socket.rooms;
      let i = 0;
      rooms.forEach((room) => {
        // we don't want to leave the socket's personal room which is guaranteed to be first
        if (i !== 0) {
          socket.leave(room);
        }
        i++;
      });
      // roomTitle is coming from the client which is not safe
      // Auth to make sure the socket has right to be in that room.
      socket.join(roomTitle);

      //fetch the number of sockets in this room
      const sockets = await io
        .of(namespace.endpoint)
        .in(roomTitle)
        .fetchSockets();
      const socketCount = sockets.length;
      ackCallBack({ numUsers: socketCount });
    });

    socket.on("newMessageToRoom", (messageObj) => {
      const rooms = socket.rooms;
      const currentRoom = rooms[1];
      io.of(namespace.endpoint)
        .in(currentRoom)
        .emit("messageToRoom", messageObj);
    });
  });
});
