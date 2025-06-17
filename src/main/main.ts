import { app, BrowserWindow, ipcMain, shell } from 'electron';
// import { autoUpdater } from 'electron-updater';
// import * as Store from 'electron-store';
import { isDebug, getAssetsPath, getHtmlPath, getPreloadPath, installExtensions } from './utils';
import './updater';
import { createTables } from './db/db';
import { registerCmpIpc } from './db/cmp';
import { registerCornerIpc } from './db/corner';
import { registerProductIpc } from './db/product';
import path from 'path';
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
console.log("main Started")

autoUpdater.logger = log;
log.transports.file.level = 'debug';

function setupDatabase() {
  // 필요한 경우 테이블 생성 작업을 수행
  try {
    createTables();
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    console.log('디비 생성 완료');
  }
}

function clearPendingInstaller() {
  const updaterPath = path.join(app.getPath('appData'), '..', 'Local', 'srkds-updater', 'pending')
  if (fs.existsSync(updaterPath)) {
    try {
      fs.rmSync(updaterPath, { recursive: true, force: true })
      console.log('[Updater] Pending updater cache cleared.')
    } catch (e) {
      console.error('[Updater] Failed to clear cache:', e)
    }
  }
}

function createWindow() {
  console.log("createWindow called");
  const mainWindow = new BrowserWindow({
    icon: getAssetsPath('icon.ico'),
    width: 1280,
    height: 800,
    webPreferences: {
      devTools: true,
      preload: getPreloadPath('preload.js'), // 👈 Don't USE PRELOAD.JS IF YOUR USING NODE IN RENDERER PROCESS
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(getHtmlPath('index.html'));

  /* AUTO UPDATER INVOKE */
  // autoUpdater.checkForUpdatesAndNotify();

  /* DEBUG DEVTOOLS */
  // if (isDebug) {
  // mainWindow.webContents.openDevTools(); // ELECTRON DEVTOOLS
  // installExtensions(); // REACT DEVTOOLS INSTALLER
  // }

  mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`❌ Failed to load: ${validatedURL} (${errorCode}) - ${errorDescription}`);
  });

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
const Store = require('electron-store');
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

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { updateAvailable: !!result?.updateInfo?.version };
  } catch (e) {
    let errorMessage = 'Unknown error';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return { updateAvailable: false, error: errorMessage };
  }
});

ipcMain.handle('download-update', async () => {
  return new Promise((resolve) => {
    autoUpdater.once('update-downloaded', () => {
      resolve({ success: true });
    });
    autoUpdater.once('error', (err: Error) => {
      resolve({ success: false, error: err.message });
    });
    autoUpdater.downloadUpdate();
  });
});

ipcMain.handle('quit-and-install', () => {
  BrowserWindow.getAllWindows().forEach((win) => win.close());

  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'http://o2pos.spcnetworks.kr/files/app/o2pos/download/srkds/'
});


autoUpdater.on('error', (error: Error) => {
  console.error('Update error:', error);
  if (isBlockmapNotFoundError(error)) {
    console.log('차등 업데이트 실패, 전체 다운로드 시도 중...');
    // 차등 다운로드 실패 시 처리(재시도 로직 또는 사용자 안내)
  }
});

autoUpdater.on('update-available', () => {
  console.log('업데이트 발견, 다운로드 시작');
  // 다운로드 진행, 차등 다운로드는 내부 처리됨
});


autoUpdater.checkForUpdatesAndNotify();

function isBlockmapNotFoundError(error: any): boolean {
  return error.message.includes('status 404') && error.message.includes('.blockmap');
}

app.whenReady().then(() => {
  setupDatabase();
  clearPendingInstaller();
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
