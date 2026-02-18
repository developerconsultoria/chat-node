const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Servidor chat activo 🚀");
});

// Cuando alguien se conecta
io.on("connection", (socket) => {

  // El usuario se identifica con su ID
  socket.on("join", (userId) => {
    socket.join("user_" + userId);
  });

  // Cuando PHP le diga que hay nuevo mensaje
  socket.on("nuevo_mensaje", (data) => {
    // Enviar SOLO al receptor
    io.to("user_" + data.receiver_id).emit("mensaje_recibido", data);
  });

});

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
