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

io.on("connection", (socket) => {

  console.log("Usuario conectado:", socket.id);

  // Unirse a sala privada
  socket.on("join", (userId) => {
    socket.join("user_" + userId);
    console.log("Usuario unido a sala:", userId);
  });

  // Recibir nuevo mensaje
  socket.on("nuevo_mensaje", (data) => {

    /*
      data debe venir así:
      {
        chat: 5,
        sender: 1,
        receiver: 2,
        text: "hola"
      }
    */

    // Enviar al receptor
    io.to("user_" + data.receiver).emit("mensaje_recibido", data);

    // Enviar también al emisor (confirmación)
    io.to("user_" + data.sender).emit("mensaje_recibido", data);

  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });

});

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
