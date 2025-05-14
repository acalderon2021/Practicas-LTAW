const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const userList = document.getElementById("user_list");
const socket = io();

// Mejora: preguntar el nickname al conectarse
let nickname = prompt("Introduce tu nickname:");
if (!nickname) nickname = "Anónimo";

socket.emit("set_nickname", nickname);

// Mejora: sonido de notificación
const sonido = new Audio("notificacion.mp3");

socket.on("message", (msg) => {
  display.innerHTML += `<div style="color:blue; margin: 5px 0;">${msg}</div>`;
  display.scrollTop = display.scrollHeight;
  sonido.play().catch(() => {}); // Prevenir errores por autoplay
});

// Actualizar lista de usuarios conectados
socket.on("user_list", (nombres) => {
  userList.innerHTML = "<strong>Usuarios conectados:</strong><ul>" +
    nombres.map(n => `<li>${n}</li>`).join("") +
    "</ul>";
});

// Enviar mensaje al pulsar Enter
msg_entry.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && msg_entry.value.trim() !== "") {
    socket.emit("chat_message", msg_entry.value.trim());
    msg_entry.value = "";
  }
});

// Mejora: el usuario ... está escribiendo
let typingTimeout;

msg_entry.addEventListener("input", () => {
  socket.emit("typing", true);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("typing", false);
  }, 2000); // Tiempo de 2 segundos
});

socket.on("typing_notice", (nick) => {
  const typingDiv = document.getElementById("typing_notice");
  if (nick) {
    typingDiv.innerText = `${nick} está escribiendo...`;
  } else {
    typingDiv.innerText = "";
  }
});
