//-- Cargar módulos
const electron = require('electron');
const path = require('path');
const ip = require('ip');

//-- Variable global para la ventana principal
let win = null;

//-- Arrancar el servidor HTTP+Socket.IO como en la práctica 3
require('./chat-server.js');  // Importa el servidor como módulo externo

console.log("Arrancando electron...");

//-- Cuando Electron esté listo
electron.app.on('ready', () => {
  console.log("Evento Ready!");

  // Crear la ventana
  win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,   // necesario para acceder a Node desde el renderer
      contextIsolation: false, // necesario para usar ipcRenderer directamente
    },
  });

  //win.setMenuBarVisibility(false); // opcional

  win.loadFile("index.html");

  // Esperar a que la ventana esté lista
  win.webContents.on('did-finish-load', () => {
    // Obtener info del sistema
    const info = {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      ip: ip.address()
    };

    // Enviar al renderer
    win.webContents.send('system-info', info);
  });
});

//-- Comunicación desde el renderer al proceso principal
electron.ipcMain.handle('test', (event, msg) => {
  console.log("-> Mensaje de test recibido desde renderer:", msg);
});
