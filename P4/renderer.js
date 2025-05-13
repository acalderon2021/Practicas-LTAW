window.electronAPI.solicitarInfo();

// Mostrar info del sistema
window.electronAPI.onInfoSistema((info) => {
  document.getElementById('node').textContent = info.node;
  document.getElementById('electron').textContent = info.electron;
  document.getElementById('chrome').textContent = info.chrome;
  document.getElementById('ip').textContent = info.ip;
});

// Actualizar número de usuarios y lista
window.electronAPI.onUserCount((data) => {
  const count = data.count ?? 0;
  const users = data.list ?? [];

  document.getElementById('users').textContent = count;

  const ul = document.getElementById('user_list');
  ul.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = user;
    ul.appendChild(li);
  });
});

// Mostrar mensajes con el nombre del usuario en color
window.electronAPI.onNewMessage((msg) => {
  const div = document.getElementById('mensajes');
  const p = document.createElement('p');

  const match = msg.match(/^(.+?):\s(.+)$/); // "usuario: mensaje"
  if (match) {
    const [_, nick, texto] = match;
    p.innerHTML = `<strong style="color: #1e90ff">${nick}:</strong> ${texto}`;
  } else {
    p.textContent = msg; // sistema, entradas, desconexiones, etc.
    p.style.color = "#666";
  }

  div.appendChild(p);
  div.scrollTop = div.scrollHeight;
});

// Botón de mensaje de prueba
document.getElementById('boton-test').addEventListener('click', () => {
  window.electronAPI.enviarMensajeTest();

  const div = document.getElementById('mensajes');
  const p = document.createElement('p');
  p.style.color = '#999';
  p.textContent = '🧪 Mensaje de prueba enviado a todos los clientes.';
  div.appendChild(p);
  div.scrollTop = div.scrollHeight;
});

// Mostrar el código QR
window.electronAPI.onQrCode((data) => {
  const qrCanvas = document.getElementById("qrCanvas");
  const ctx = qrCanvas.getContext("2d");
  const img = new Image();

  img.onload = () => {
    qrCanvas.width = img.width;
    qrCanvas.height = img.height;
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    ctx.drawImage(img, 0, 0);
  };

  img.src = data.qrDataURL;
  document.getElementById("connectionURL").innerText = data.connectionURL;
});