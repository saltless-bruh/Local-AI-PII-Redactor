const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendToPython: (command) => ipcRenderer.invoke('send-to-python', command),
  onPythonResponse: (callback) => ipcRenderer.on('python-response', (event, data) => callback(data))
});
