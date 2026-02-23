const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 3000;

// { userId: [socketId, socketId] }
let users = {};

app.get("/", (req, res) => {
  res.send("Servidor chat activo 🚀");
});

io.on("connection", (socket) => {

  console.log("Usuario conectado:", socket.id);

  // =========================
  // REGISTRAR USUARIO
  // =========================
  socket.on("register", ({ userId }) => {

    if (!users[userId]) {
      users[userId] = [];
    }

    users[userId].push(socket.id);

    console.log("Usuarios activos:", users);

    io.emit("users_online", Object.keys(users));
  });

  // =========================
  // ESCRIBIENDO
  // =========================
  socket.on("typing", (data) => {

    const socketsTo = users[data.to] || [];

    socketsTo.forEach((sid) => {
      io.to(sid).emit("userTyping", {
        from: data.from,
      });
    });

  });

  // =========================
  // MENSAJE LEÍDO
  // =========================
  socket.on("messageRead", (data) => {

    const socketsTo = users[data.other] || [];

    socketsTo.forEach((sid) => {
      io.to(sid).emit("messageRead", {
        chat_id: data.chat_id,
        reader: data.reader
      });
    });

  });

  // =========================
  // MENSAJE PRIVADO
  // =========================
  socket.on("privateMessage", (data) => {

    const socketsTo = users[data.to] || [];

    socketsTo.forEach((sid) => {
      io.to(sid).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from,
        from_name: data.from_name,
        message: data.message,
      });
    });

    const socketsFrom = users[data.from] || [];

    socketsFrom.forEach((sid) => {
      io.to(sid).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from,
        from_name: data.from_name,
        message: data.message,
      });
    });

  });

  // =========================
  // DESCONECTAR
  // =========================
  socket.on("disconnect", () => {

    console.log("Usuario desconectado:", socket.id);

    for (let userId in users) {
      users[userId] = users[userId].filter(id => id !== socket.id);

      if (users[userId].length === 0) {
        delete users[userId];
      }
    }

    console.log("Usuarios activos:", users);

    io.emit("users_online", Object.keys(users));
  });

});

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
