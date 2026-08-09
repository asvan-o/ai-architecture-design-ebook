const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const { OrganizerService } = require('./organizer.cjs');

if (require('electron-squirrel-startup')) app.quit();

const smokeMode = process.argv.includes('--smoke');
if (smokeMode) app.setPath('userData', path.join(os.tmpdir(), `design-project-auto-organizer-smoke-${process.pid}`));

app.setAppUserModelId('com.squirrel.DesignProjectAutoOrganizer.DesignProjectAutoOrganizer');

let mainWindow;
let service;
let shutdownStarted = false;

function sendEvent(event) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('organizer:event', event);
}

async function createWindow() {
  service = new OrganizerService({
    settingsPath: path.join(app.getPath('userData'), 'settings.json'),
    onEvent: sendEvent,
  });
  await service.loadSavedRoot();
  await service.start();

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 900,
    minHeight: 620,
    show: !smokeMode,
    backgroundColor: '#f4f1e9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  await mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (smokeMode) {
    console.log('ELECTRON_SMOKE_READY');
    setTimeout(() => app.quit(), 350);
  }
}

ipcMain.handle('organizer:choose-root', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '설계 프로젝트 ROOT 폴더 선택',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || result.filePaths.length === 0) return service.snapshot();
  return service.setRoot(result.filePaths[0]);
});

ipcMain.handle('organizer:create-project', async (_event, name) => service.createProject(name));
ipcMain.handle('organizer:snapshot', async () => service.snapshot());

app.whenReady().then(createWindow).catch((error) => {
  console.error(error);
  app.exit(1);
});

app.on('window-all-closed', () => app.quit());

app.on('before-quit', (event) => {
  if (shutdownStarted) return;
  event.preventDefault();
  shutdownStarted = true;
  Promise.resolve(service?.close())
    .catch((error) => console.error('Watcher close failed:', error))
    .finally(async () => {
      if (smokeMode) await fs.rm(app.getPath('userData'), { recursive: true, force: true }).catch(() => {});
      app.exit(0);
    });
});
