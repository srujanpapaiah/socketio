const express = require("express");
const app = express();
const socketio = require("socket.io");

const namespaces = require("./data/namespaces");
const Room = require("./classes/Room");

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
    socket.on("joinRoom", async (roomObj, ackCallBack) => {
      // fetch history
      const thisNs = namespaces[roomObj.namespaceId];
      const thisRoomObj = thisNs.rooms.find(
        (room) => room.roomTitle === roomObj.roomTitle
      );
      const thisRoomHistory = thisRoomObj.history;

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
      socket.join(roomObj.roomTitle);

      //fetch the number of sockets in this room
      const sockets = await io
        .of(namespace.endpoint)
        .in(roomObj.roomTitle)
        .fetchSockets();
      const socketCount = sockets.length;
      ackCallBack({ numUsers: socketCount, thisRoomHistory });
    });

    socket.on("newMessageToRoom", (messageObj) => {
      const rooms = socket.rooms;
      const currentRoom = [...rooms][1];
      io.of(namespace.endpoint)
        .in(currentRoom)
        .emit("messageToRoom", messageObj);

      const thisNs = namespaces[messageObj.selectedNsId];
      const thisRoom = thisNs.rooms.find(
        (room) => room.roomTitle === currentRoom
      );
      thisRoom.addMessage(messageObj);
      console.log(thisRoom);
    });
  });
});
