const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayApi', {
  onConfig: (cb) => {
    const handler = (_e, config) => cb(config);
    ipcRenderer.on('overlay:config', handler);
    ipcRenderer.send('overlay:ready');
    return () => ipcRenderer.removeListener('overlay:config', handler);
  },
});
