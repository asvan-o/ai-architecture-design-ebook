const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('organizer', {
  chooseRoot: () => ipcRenderer.invoke('organizer:choose-root'),
  createProject: (name) => ipcRenderer.invoke('organizer:create-project', name),
  snapshot: () => ipcRenderer.invoke('organizer:snapshot'),
  onEvent: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('organizer:event', handler);
    return () => ipcRenderer.removeListener('organizer:event', handler);
  },
});
