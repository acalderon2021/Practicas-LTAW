const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  solicitarInfo: () => ipcRenderer.send('solicitar_info'),
  onInfoSistema: (cb) => ipcRenderer.on('info_sistema', (_, data) => cb(data)),
  onUserCount: (cb) => ipcRenderer.on('user_count', (_, data) => cb(data)),
  onNewMessage: (cb) => ipcRenderer.on('new_message', (_, msg) => cb(msg)),
  enviarMensajeTest: () => ipcRenderer.send('enviar_mensaje_test'),
  onQrCode: (cb) => ipcRenderer.on('qr_code', (_, data) => cb(data))
});
