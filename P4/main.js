//-- Cargar módulos
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ip = require('ip');

//-- Arrancar el servidor HTTP+Socket.IO
require('./chat-server.js');  // Servidor arrancado como en práctica 3

let win = null;

console.log("Arrancando Electron...");

app.on('ready', () => {
  console.log("Evento Ready!");

  // Crear la ventana principal
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,   // Necesario para usar require en el renderer
      contextIsolation: false, // Permite ipcRenderer directamente
    },
  });

  // Cargar la interfaz HTML
  win.loadFile("index.html");

  // Enviar info del sistema una vez que la ventana está lista
  win.webContents.on('did-finish-load', () => {
    const info = {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      ip: ip.address(),
    };

    win.webContents.send('system-info', info);
  });
});

//-- Comunicación opcional desde el renderer
ipcMain.handle('test', (event, msg) => {
  console.log("-> Mensaje de test recibido desde renderer:", msg);
});
