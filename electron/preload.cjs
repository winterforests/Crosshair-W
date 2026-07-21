const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('crosshairW', {
  getOverlayStatus: () => ipcRenderer.invoke('overlay:get-status'),
  setOverlayEnabled: (enabled) => ipcRenderer.invoke('overlay:set-enabled', enabled),
  toggleOverlay: () => ipcRenderer.invoke('overlay:toggle'),
  setOverlayConfig: (config) => ipcRenderer.invoke('overlay:set-config', config),
  updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
  listDisplays: () => ipcRenderer.invoke('displays:list'),
  loadSave: () => ipcRenderer.invoke('save:load'),
  writeSave: (data) => ipcRenderer.invoke('save:write', data),
  onOverlayStatus: (cb) => {
    const handler = (_e, data) => cb(data);
    ipcRenderer.on('overlay:status', handler);
    return () => ipcRenderer.removeListener('overlay:status', handler);
  },
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
});
