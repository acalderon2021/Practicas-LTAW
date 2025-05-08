const socketServer = require('socket.io').Server;
const http = require('http');
const express = require('express');
const colors = require('colors');

const PUERTO = 8080;
const app = express();
const server = http.Server(app);
const io = new socketServer(server);

// Mapa de socket.id -> nickname
const usuarios = new Map();

app.get('/', (req, res) => {
  res.send('Bienvenido a mi aplicación Web!!!' + '<p><a href="/index.html">Test</a></p>');
});

// Servir archivos estáticos
app.use('/', express.static(__dirname + '/'));
app.use(express.static('public'));

function enviarListaUsuarios() {
  const lista = Array.from(usuarios.values());
  io.emit("user_list", lista); // Emitir a todos
}

io.on('connect', (socket) => {
  console.log('** NUEVA CONEXIÓN **'.yellow);

  socket.on('set_nickname', (nickname) => {
    if (!nickname) nickname = "Anónimo";
    usuarios.set(socket.id, nickname);
    console.log(`Usuario conectado: ${nickname}`.green);

    socket.send(`👋 ¡Bienvenido al chat, ${nickname}!`);
    socket.broadcast.emit("message", `🔔 ${nickname} se ha conectado`);

    enviarListaUsuarios();

    socket.on("typing", (isTyping) => {
      const nick = usuarios.get(socket.id);
      if (!nick) return;
    
      socket.broadcast.emit("typing_notice", isTyping ? nick : null);
    });    
  });

  socket.on('disconnect', () => {
    const nick = usuarios.get(socket.id) || "Un usuario";
    console.log(`** ${nick} se ha desconectado **`.yellow);
    socket.broadcast.emit("message", `❌ ${nick} se ha desconectado`);
    usuarios.delete(socket.id);
    enviarListaUsuarios();
  });

  socket.on("chat_message", (msg) => {
    const nick = usuarios.get(socket.id) || "Anónimo";

    // ----- Comandos -----
    if (msg.startsWith("/")) {
      const partes = msg.trim().split(" ");

      switch (partes[0]) {
        case "/help":
          socket.send(
            "📖 Comandos disponibles:<br>" +
            "/help → Muestra esta ayuda<br>" +
            "/list → Lista de usuarios conectados<br>" +
            "/hello → Saludo del servidor<br>" +
            "/date → Fecha y hora actual<br>" +
            "/dm (usuario) (mensaje) → Mensaje directo privado<br>" +
            "@(usuario>) (mensaje) → Mención destacada"
          );
          break;

        case "/list":
          const lista = Array.from(usuarios.values()).join(", ");
          socket.send(`👥 Usuarios conectados (${usuarios.size}): ${lista}`);
          break;

        case "/hello":
          socket.send(`Hola, ${nick} 👋`);
          break;

        case "/date":
          socket.send(`📅 Fecha actual: ${new Date().toLocaleString()}`);
          break;

        // Mejora: mensajes directos
        case "/dm":
          const destinatario = partes[1];
          const contenido = partes.slice(2).join(" ");
          const socketDestino = [...usuarios.entries()].find(([_, n]) => n === destinatario)?.[0];

          if (socketDestino) {
            io.to(socketDestino).emit("message", `📩 DM de ${nick}: ${contenido}`);
            socket.send(`📤 DM a ${destinatario}: ${contenido}`);
          } else {
            socket.send(`❌ Usuario ${destinatario} no encontrado.`);
          }
          break;

        default:
          socket.send("❌ Comando no reconocido. Usa /help para ver opciones.");
      }

      return; // No continuar con el resto
    }

    // Mejora: menciones con @
    const menciones = Array.from(usuarios.entries()).filter(([_, nombre]) =>
      msg.includes(`@${nombre}`)
    );

    menciones.forEach(([id, nombre]) => {
      io.to(id).emit("message", `📣 ¡Has sido mencionado por ${nick}!`);
    });

    // ----- Mensaje público -----
    io.emit("message", `${nick}: ${msg}`);
  });
});

server.listen(PUERTO);
console.log("Servidor escuchando en el puerto " + PUERTO);
