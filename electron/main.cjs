const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  screen,
  Tray,
  Menu,
  nativeImage,
} = require('electron');
const path = require('path');

const fs = require('fs');

function savePath() {
  return path.join(app.getPath('userData'), 'crosshairw-save.json');
}

function readSaveFile() {
  try {
    const p = savePath();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeSaveFile(data) {
  try {
    fs.writeFileSync(savePath(), JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

const isDev = !app.isPackaged;

function appRoot(...parts) {
  return path.join(__dirname, '..', ...parts);
}

function iconFile() {
  const ico = appRoot('build', 'icon.ico');
  if (fs.existsSync(ico)) return ico;
  return appRoot('public', 'logo.png');
}

let mainWindow = null;
let overlayWindow = null;
let tray = null;
let adsTimer = null;

const state = {
  enabled: false,
  visible: true,
  _adsHeld: false,
  config: null,
  settings: {
    toggleHotkey: 'F7',
    monitor: 'primary',
    hideOnAds: false,
    launchMinimized: false,
  },
};

function getDisplay() {
  const displays = screen.getAllDisplays();
  if (state.settings.monitor === 'primary') return screen.getPrimaryDisplay();
  const idx = Number(state.settings.monitor) - 1;
  return displays[idx] || screen.getPrimaryDisplay();
}

function createOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) return overlayWindow;

  const { x, y, width, height } = getDisplay().bounds;

  overlayWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    hasShadow: false,
    thickFrame: false,
    fullscreenable: false,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload-overlay.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (isDev) overlayWindow.loadURL('http://localhost:5173/overlay.html');
  else overlayWindow.loadFile(path.join(__dirname, '..', 'dist', 'overlay.html'));

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

function pushConfigToOverlay() {
  if (!overlayWindow || overlayWindow.isDestroyed() || !state.config) return;
  overlayWindow.webContents.send('overlay:config', state.config);
}

function broadcastStatus() {
  const payload = {
    enabled: state.enabled,
    visible: Boolean(state.enabled && state.visible && !state._adsHeld),
    hotkey: state.settings.toggleHotkey,
  };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('overlay:status', payload);
  }
}

function applyOverlayVisibility() {
  if (!state.enabled) {
    if (overlayWindow && !overlayWindow.isDestroyed()) overlayWindow.hide();
    broadcastStatus();
    return;
  }

  const win = createOverlayWindow();
  const { x, y, width, height } = getDisplay().bounds;
  win.setBounds({ x, y, width, height });

  if (state.visible && !state._adsHeld) {
    win.showInactive();
    pushConfigToOverlay();
  } else {
    win.hide();
  }
  broadcastStatus();
}

function setEnabled(enabled) {
  state.enabled = Boolean(enabled);
  if (state.enabled) state.visible = true;
  applyOverlayVisibility();
  state._rebuildTray?.();
}

function toggleOverlay() {
  if (!state.enabled) {
    setEnabled(true);
    return;
  }
  state.visible = !state.visible;
  applyOverlayVisibility();
  state._rebuildTray?.();
}

function registerHotkey() {
  globalShortcut.unregisterAll();
  const key = state.settings.toggleHotkey || 'F7';
  const ok = globalShortcut.register(key, () => toggleOverlay());
  if (!ok && key !== 'F7') {
    globalShortcut.register('F7', () => toggleOverlay());
    state.settings.toggleHotkey = 'F7';
  }
}

function startAdsWatcher() {
  stopAdsWatcher();
  if (!state.settings.hideOnAds || process.platform !== 'win32') return;

  let GetAsyncKeyState;
  try {
    const koffi = require('koffi');
    const user32 = koffi.load('user32.dll');
    GetAsyncKeyState = user32.func('int __stdcall GetAsyncKeyState(int)');
  } catch {
    return;
  }

  const VK_RBUTTON = 0x02;
  adsTimer = setInterval(() => {
    if (!state.enabled || !state.settings.hideOnAds) return;
    const held = (GetAsyncKeyState(VK_RBUTTON) & 0x8000) !== 0;
    if (held !== state._adsHeld) {
      state._adsHeld = held;
      applyOverlayVisibility();
    }
  }, 16);
}

function stopAdsWatcher() {
  if (adsTimer) clearInterval(adsTimer);
  adsTimer = null;
  state._adsHeld = false;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 620,
    minWidth: 860,
    minHeight: 540,
    backgroundColor: '#0b0b0b',
    title: 'CrosshairW',
    icon: iconFile(),
    frame: false,
    show: !state.settings.launchMinimized,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) mainWindow.loadURL('http://localhost:5173');
  else mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = iconFile();
  let image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) {
    image = nativeImage.createFromPath(appRoot('public', 'logo.png'));
  }
  if (!image.isEmpty()) image = image.resize({ width: 16, height: 16 });
  tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image);
  tray.setToolTip('CrosshairW');
  const rebuild = () => {
    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: 'Open CrosshairW',
          click: () => {
            if (!mainWindow) createMainWindow();
            mainWindow.show();
            mainWindow.focus();
          },
        },
        {
          label: state.enabled ? 'Disable Overlay' : 'Enable Overlay',
          click: () => setEnabled(!state.enabled),
        },
        { label: 'Toggle Visibility', click: () => toggleOverlay() },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            app.isQuitting = true;
            app.quit();
          },
        },
      ])
    );
  };
  rebuild();
  tray.on('double-click', () => {
    if (!mainWindow) createMainWindow();
    mainWindow.show();
    mainWindow.focus();
  });
  state._rebuildTray = rebuild;
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.crosshairw.app');
  }
  createMainWindow();
  createTray();
  registerHotkey();
});

app.on('before-quit', () => {
  app.isQuitting = true;
  stopAdsWatcher();
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
    overlayWindow = null;
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopAdsWatcher();
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') app.quit();
});

ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window:close', () => mainWindow?.close());

ipcMain.handle('overlay:get-status', async () => ({
  enabled: state.enabled,
  visible: Boolean(state.enabled && state.visible && !state._adsHeld),
  hotkey: state.settings.toggleHotkey,
}));

ipcMain.handle('overlay:set-enabled', async (_e, enabled) => {
  setEnabled(enabled);
  return {
    enabled: state.enabled,
    visible: Boolean(state.enabled && state.visible && !state._adsHeld),
  };
});

ipcMain.handle('overlay:toggle', async () => {
  toggleOverlay();
  return {
    enabled: state.enabled,
    visible: Boolean(state.enabled && state.visible && !state._adsHeld),
  };
});

ipcMain.handle('overlay:set-config', async (_e, config) => {
  state.config = config;
  pushConfigToOverlay();
  return true;
});

ipcMain.handle('settings:update', async (_e, settings) => {
  state.settings = { ...state.settings, ...settings };
  registerHotkey();
  if (state.settings.hideOnAds) startAdsWatcher();
  else {
    stopAdsWatcher();
    applyOverlayVisibility();
  }
  if (state.enabled) applyOverlayVisibility();
  return state.settings;
});

ipcMain.handle('displays:list', async () =>
  screen.getAllDisplays().map((d, i) => ({
    id: String(i + 1),
    label: `Monitor ${i + 1}${d.id === screen.getPrimaryDisplay().id ? ' (Primary)' : ''}`,
  }))
);

ipcMain.on('overlay:ready', () => {
  pushConfigToOverlay();
});

ipcMain.handle('save:load', async () => readSaveFile());

ipcMain.handle('save:write', async (_e, data) => {
  if (data?.settings) {
    state.settings = { ...state.settings, ...data.settings };
  }
  if (data?.config) {
    state.config = data.config;
  }
  return writeSaveFile(data);
});
