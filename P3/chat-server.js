const socketServer = require('socket.io').Server;
const http = require('http');
const express = require('express');
const colors = require('colors');

const PUERTO = 8080;
const app = express();
const server = http.Server(app);
const io = new socketServer(server);

let totalUsuarios = 0;

app.get('/', (req, res) => {
  res.send('Bienvenido a mi aplicación Web!!!' + '<p><a href="/index.html">Test</a></p>');
});

app.use('/', express.static(__dirname + '/'));
app.use(express.static('public'));

io.on('connect', (socket) => {
  totalUsuarios++;
  console.log('** NUEVA CONEXIÓN **'.yellow);

  // Mensaje solo al nuevo usuario
  socket.send("👋 ¡Bienvenido al chat!");

  // Anunciar al resto que alguien nuevo se ha conectado
  socket.broadcast.emit("message", "🔔 Un nuevo usuario se ha conectado");

  socket.on('disconnect', () => {
    totalUsuarios--;
    console.log('** CONEXIÓN TERMINADA **'.yellow);
  });

  socket.on("message", (msg) => {
    console.log("Mensaje recibido: " + msg.blue);

    if (msg.startsWith("/")) {
      // Comandos especiales
      let respuesta = "";
      switch (msg.trim()) {
        case "/help":
          respuesta = "Comandos disponibles:\n/help\n/list\n/hello\n/date";
          break;
        case "/list":
          respuesta = `Usuarios conectados: ${totalUsuarios}`;
          break;
        case "/hello":
          respuesta = "👋 ¡Hola! ¿Cómo estás?";
          break;
        case "/date":
          respuesta = `📅 Fecha actual: ${new Date().toLocaleString()}`;
          break;
        default:
          respuesta = "❌ Comando no reconocido. Usa /help para ver opciones.";
      }
      socket.send(respuesta); // Solo al cliente que lo pidió
    } else {
      // Reenviar a todos
      io.send(msg);
    }
  });
});

server.listen(PUERTO);
console.log("Servidor escuchando en el puerto " + PUERTO);
