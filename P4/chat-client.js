const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const userList = document.getElementById("user_list");
const socket = io();

const nickname = prompt("Bienvenido al chat de URJC\nIntroduce tu nombre:");
if (!nickname) nickname = "Anónimo";

socket.emit("set_nickname", nickname);

// Notificación sonora
const sonido = new Audio("notificacion.mp3");

// Función para renderizar mensaje con nombre separado
function renderMessage(rawMsg) {
  const separatorIndex = rawMsg.indexOf(":");
  if (separatorIndex === -1) {
    return `<div class="chat-message">${rawMsg}</div>`;
  }

  const user = rawMsg.slice(0, separatorIndex);
  const message = rawMsg.slice(separatorIndex + 1).trim();

  return `<div class="chat-message">
    <span class="username">${user}:</span> <span class="message-text">${message}</span>
  </div>`;
}

socket.on("message", (msg) => {
  display.innerHTML += renderMessage(msg);
  display.scrollTop = display.scrollHeight;
  sonido.play().catch(() => {});
});

// Lista de usuarios conectados
socket.on("user_list", (nombres) => {
  userList.innerHTML = "<strong>Usuarios conectados:</strong><ul>" +
    nombres.map(n => `<li>${n}</li>`).join("") +
    "</ul>";
});

// Enviar mensaje con Enter
msg_entry.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && msg_entry.value.trim() !== "") {
    socket.emit("chat_message", msg_entry.value.trim());
    msg_entry.value = "";
  }
});

// Aviso de "escribiendo..."
let typingTimeout;
msg_entry.addEventListener("input", () => {
  socket.emit("typing", true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("typing", false);
  }, 2000);
});

socket.on("typing_notice", (nick) => {
  const typingDiv = document.getElementById("typing_notice");
  typingDiv.innerText = nick ? `${nick} está escribiendo...` : "";
});
