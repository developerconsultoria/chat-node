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

  // =========================
  // REGISTRAR USUARIO
  // =========================
  socket.on("register", ({ userId }) => {

    users[userId] = socket.id;

    console.log(`Usuario ${userId} registrado con socket ${socket.id}`);

    // 🔥 Notificar a TODOS que este usuario está online
    io.emit("userOnline", { userId });
  });


  // =========================
  // MENSAJE PRIVADO
  // =========================
  socket.on("privateMessage", (data) => {

    const socketTo = users[data.to];
    const socketFrom = users[data.from];

    // Emitir al receptor
    if (socketTo) {
      io.to(socketTo).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from,
        from_name: data.from_name,
        message: data.message,
      });
    }

    // Emitir al emisor (confirmación correcta)
    if (socketFrom) {
      io.to(socketFrom).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from,
        from_name: data.from_name,
        message: data.message,
      });
    }
  });


  // =========================
  // DESCONECTAR USUARIO
  // =========================
  socket.on("disconnect", () => {

    console.log("Usuario desconectado:", socket.id);

    for (let uid in users) {
      if (users[uid] === socket.id) {

        delete users[uid];

        // 🔥 Notificar que está offline
        io.emit("userOffline", { userId: uid });

        break;
      }
    }
  });

});

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
