const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const generateMessage = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));

io.on("connection", socket => {
  console.log("New websocket connection");

  socket.on("join", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    const welcomeMsg = `Happy to see you, ${user.username}!`;
    socket.emit("welcomeMsg", generateMessage("Admin", welcomeMsg));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
  });

  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed to user");
    }

    io.to(user.room).emit("message", generateMessage(user.username, msg));
    callback();
  });

  socket.on("sendLocation", (latitude, longitude, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateMessage(
        user.username,
        `https://www.google.com/maps/@${longitude},${latitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

module.exports = server;
