const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 3000;

// 🔥 AHORA SOPORTA MULTIPLES CONEXIONES POR USUARIO
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

    // 🔥 Enviar lista completa de usuarios online
    io.emit("users_online", Object.keys(users));
  });


  // =========================
  // MENSAJE PRIVADO
  // =========================
  socket.on("privateMessage", (data) => {

    /*
      data = {
        chat_id,
        from,
        from_name,
        to,
        message
      }
    */

    // 🔥 ENVIAR AL RECEPTOR (TODAS SUS PESTAÑAS)
    const socketsTo = users[data.to] || [];

    socketsTo.forEach(sid => {
      io.to(sid).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from,
        from_name: data.from_name,
        message: data.message,
      });
    });

    // 🔥 ENVIAR AL EMISOR (TODAS SUS PESTAÑAS)
    const socketsFrom = users[data.from] || [];

    socketsFrom.forEach(sid => {
      io.to(sid).emit("receiveMessage", {
        chat_id: data.chat_id,
        from: data.from,
        from_name: data.from_name,
        message: data.message,
      });
    });

  });


  // =========================
  // DESCONECTAR USUARIO
  // =========================
  socket.on("disconnect", () => {

    console.log("Usuario desconectado:", socket.id);

    for (let userId in users) {

      // quitar solo este socket
      users[userId] = users[userId].filter(id => id !== socket.id);

      // si ya no tiene sockets → eliminar usuario
      if (users[userId].length === 0) {
        delete users[userId];
      }
    }

    console.log("Usuarios activos:", users);

    // 🔥 actualizar lista online
    io.emit("users_online", Object.keys(users));
  });

});

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
