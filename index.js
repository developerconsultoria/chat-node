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

  // Registro de usuario
  socket.on("register", ({ userId }) => {
    users[userId] = socket.id;
    console.log(`Usuario ${userId} registrado con socket ${socket.id}`);
  });

  // Mensaje privado
  socket.on("privateMessage", (data) => {
    // Emitir al receptor
    const socketTo = users[data.to];
    if (socketTo) {
      io.to(socketTo).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from, // 🔥 IMPORTANTE
        from_name: data.from_name,
        message: data.message,
      });
    }

    // Emitir al emisor (para confirmación)
    // Emitir al emisor (confirmación correcta)
    const socketFrom = users[data.from];
    if (socketFrom) {
      io.to(socketFrom).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from, // 🔥 IMPORTANTE
        from_name: data.from_name,
        message: data.message,
      });
    }
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
