const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const qrcode = require('qrcode');
const { startServer, getIP, enviarMensajePrueba } = require('./chat-server');

let mainWindow;

// Función para obtener la IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let name of Object.keys(interfaces)) {
    for (let iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 640,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('renderer.html');
}

app.whenReady().then(() => {
  createWindow();

  // Manejo de eventos de la ventana (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Iniciar el servidor
  startServer(
    (usuariosConectados, listaUsuarios) => {
      if (mainWindow) {
        mainWindow.webContents.send('user_count', {
          count: usuariosConectados,
          list: listaUsuarios
        });
      }
    },
    (mensaje) => {
      if (mainWindow) {
        mainWindow.webContents.send('new_message', mensaje);
      }
    }
  );

  const ipLocal = getLocalIP();
  const puerto = 8080;

  // Enviar info del sistema
  const infoSistema = {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    ip: ipLocal,
    puerto
  };

  // Enviar QR y sistema cuando la ventana esté lista
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('info_sistema', infoSistema);
  
    const connectionURL = `http://${infoSistema.ip}:${infoSistema.puerto}/index.html`;
    qrcode.toDataURL(connectionURL, (err, qrDataURL) => {
      if (err) {
        console.error("Error al generar el QR:", err);
      } else {
        mainWindow.webContents.send("qr_code", {
          qrDataURL,
          connectionURL
        });
      }
    });
  });
  
});

// Cerrar la app cuando se cierran todas las ventanas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Evento recibido desde el render para enviar mensaje de prueba
ipcMain.on('enviar_mensaje_test', () => {
  enviarMensajePrueba();
});
