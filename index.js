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
  res.send("Servidor de chat funcionando 🚀");
});

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("mensaje", (data) => {
    io.emit("mensaje", data);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
