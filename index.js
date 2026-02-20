const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 3000;

// Guardar usuarios conectados { userId: socketId }
let users = {};

app.get("/", (req, res) => {
  res.send("Servidor chat activo 🚀");
});

io.on("connection", (socket) => {

  console.log("Usuario conectado:", socket.id);

  socket.on("register", ({ userId }) => {

    users[userId] = socket.id;

    console.log(`Usuario ${userId} registrado`);

    // 🔥 Notificar que este usuario está online
    io.emit("userOnline", { userId });

  });

  socket.on("privateMessage", (data) => {

    const socketTo = users[data.to];
    const socketFrom = users[data.from];

    if (socketTo) {
      io.to(socketTo).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from,
        from_name: data.from_name,
        message: data.message,
      });
    }

    if (socketFrom) {
      io.to(socketFrom).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from,
        from_name: data.from_name,
        message: data.message,
      });
    }
  });

  socket.on("disconnect", () => {

    console.log("Usuario desconectado:", socket.id);

    // 🔥 Buscar qué usuario se desconectó
    for (let uid in users) {
      if (users[uid] === socket.id) {
        delete users[uid];

        // 🔥 Notificar que está offline
        io.emit("userOffline", { userId: uid });
      }
    }
  });

});

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    // Limpiar usuario desconectado
    for (let uid in users) {
      if (users[uid] === socket.id) delete users[uid];
    }
  });
});

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
