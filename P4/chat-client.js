// Requiere ipcRenderer para comunicarse con el proceso principal de Electron
const { ipcRenderer } = require("electron");

// Escuchar evento del sistema para obtener información e iniciar la conexión
ipcRenderer.on("system-info", (event, info) => {
  // Mostrar la información del sistema (como la IP local) en la interfaz
  const infoDiv = document.createElement("div");
  infoDiv.innerHTML = `
    <p>🛠️ Node: ${info.node}</p>
    <p>🌐 Chrome: ${info.chrome}</p>
    <p>⚡ Electron: ${info.electron}</p>
    <p>📡 IP local: ${info.ip}</p>
  `;
  infoDiv.style.padding = "10px";
  infoDiv.style.backgroundColor = "#eef";
  document.body.prepend(infoDiv);

  // Conectar al servidor usando la IP proporcionada desde el proceso principal
  const socket = io(`http://${info.ip}:8080`);
  iniciarChat(socket); // Iniciar la funcionalidad del chat
});

function iniciarChat(socket) {
  const display = document.getElementById("display");
  const msg_entry = document.getElementById("msg_entry");
  const userList = document.getElementById("user_list");
  const sonido = new Audio("notificacion.mp3");  // Sonido de notificación para nuevos mensajes

  // Pedir al usuario un nickname para ingresar al chat
  let nickname = prompt("Introduce tu nickname:");
  if (!nickname) nickname = "Anónimo";  // Si no se introduce un nombre, usar "Anónimo"
  socket.emit("set_nickname", nickname);  // Enviar el nickname al servidor

  // Escuchar y recibir mensajes del servidor
  socket.on("message", (msg) => {
    display.innerHTML += `<div style="color:blue; margin: 5px 0;">${msg}</div>`;
    display.scrollTop = display.scrollHeight;  // Asegurarse de que el área de mensajes se desplace hacia abajo
    sonido.play().catch(() => {});  // Reproducir el sonido de notificación
  });

  // Actualizar la lista de usuarios conectados
  socket.on("user_list", (nombres) => {
    userList.innerHTML = "<strong>Usuarios conectados:</strong><ul>" +
      nombres.map(n => `<li>${n}</li>`).join("") +
      "</ul>";
  });

  // Enviar mensaje cuando el usuario presiona "Enter"
  msg_entry.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && msg_entry.value.trim() !== "") {
      socket.emit("chat_message", msg_entry.value.trim());  // Enviar el mensaje al servidor
      msg_entry.value = "";  // Limpiar el campo de entrada
    }
  });

  // Notificar que el usuario está escribiendo
  let typingTimeout;
  msg_entry.addEventListener("input", () => {
    socket.emit("typing", true);  // Enviar "escribiendo" al servidor
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("typing", false);  // Detener el estado "escribiendo" después de un breve tiempo
    }, 2000);
  });

  // Mostrar quién está escribiendo
  socket.on("typing_notice", (nick) => {
    const typingDiv = document.getElementById("typing_notice");
    typingDiv.innerText = nick ? `${nick} está escribiendo...` : "";  // Mostrar o quitar el mensaje de "escribiendo"
  });
}
