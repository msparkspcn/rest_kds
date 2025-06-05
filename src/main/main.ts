import { app, BrowserWindow, ipcMain, shell } from 'electron';
// import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import { isDebug, getAssetsPath, getHtmlPath, getPreloadPath, installExtensions } from './utils';
import './updater';
import { createTables } from './db/db';
import { registerCmpIpc } from './db/cmp';
import { registerCornerIpc } from './db/corner';
import { registerProductIpc } from './db/product';
import path from 'path';
const fs = require('fs');

function setupDatabase() {
  // 필요한 경우 테이블 생성 작업을 수행
  try {
    createTables();
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    console.log("디비 생성 완료")
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    icon: getAssetsPath('icon.ico'),
    width: 1500,
    height: 900,
    webPreferences: {
      devTools: isDebug,
      preload: getPreloadPath('preload.js'), // 👈 Don't USE PRELOAD.JS IF YOUR USING NODE IN RENDERER PROCESS
      nodeIntegration: true, // 렌더러 프로세스에서 Node.js 모듈을 사용할 수 있도록 함
      contextIsolation: true, // 👈 ENABLE THIS FOR NODE INTEGRATION IN RENDERER
    },
  });

  mainWindow.loadURL(getHtmlPath('index.html'));

  /* AUTO UPDATER INVOKE */
  // autoUpdater.checkForUpdatesAndNotify();

  /* DEBUG DEVTOOLS */
  if (isDebug) {
    mainWindow.webContents.openDevTools(); // ELECTRON DEVTOOLS
    installExtensions(); // REACT DEVTOOLS INSTALLER
  }

  /* URLs OPEN IN DEFAULT BROWSER */
  mainWindow.webContents.setWindowOpenHandler((data) => {
    shell.openExternal(data.url);
    return { action: 'deny' };
  });
}

/* IPC EVENTS EXAMPLE */
ipcMain.on('message', (event, arg) => {
  // eslint-disable-next-line no-console
  console.log(`IPC Example: ${arg}`);
  event.reply('reply', 'Ipc Example:  pong 🏓');
});

/** ELECTRON STORE EXAMPLE
 *  NOTE: LOCAL STORAGE FOR YOUR APPLICATION
 */
const store = new Store();
ipcMain.on('set', (_event, key, val) => {
  // eslint-disable-next-line no-console
  console.log(`Electron Store Example: key: ${key}, value: ${val}`);
  store.set(key, val);
});
ipcMain.on('get', (event, val) => {
  // eslint-disable-next-line no-param-reassign
  event.returnValue = store.get(val);
});

ipcMain.on('app:quit', () => app.quit());

ipcMain.on('log-to-file', (event, log) => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // '2025-06-05' → '20250605'
  const logFileName = `${dateStr}.log`;
  const logFilePath = path.join(__dirname, logFileName);

  const timeStampedLog = `[${new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul'
  })}] ${log}\n`;

  console.log("logFilePath:"+logFilePath)
  fs.appendFile(logFilePath, timeStampedLog, (err: any) => {
    if (err) {
      console.error('Failed to write log:', err);
    }
  });
})

app.whenReady().then(() => {
  setupDatabase();
  registerCmpIpc();
  registerCornerIpc();
  registerProductIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

