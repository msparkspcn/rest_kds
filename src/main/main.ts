import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { isDebug, getAssetsPath, getHtmlPath, getPreloadPath, installExtensions } from './utils';
import './updater';
import { createTables } from './db/db';
import { registerCmpIpc } from './db/cmp';
import { registerCornerIpc } from './db/corner';
import { registerProductIpc } from './db/product';
import path from 'path';
import { registerOrderIpc } from './db/order';
import { registerSalesorgIpc } from './db/salesorg';
import { registerSaleOpenIpc } from './db/saleOpen';

const ProgressBar = require('electron-progressbar');
const fs = require('fs');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
let mainWindow: BrowserWindow | null = null;
console.log("main Started")

autoUpdater.logger = log;
log.transports.console.level = 'debug';
log.transports.file.level = 'debug';
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.autoDownload =false;
let progressBar: ProgressBar | null = null;

function setupDatabase() {
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
  mainWindow = new BrowserWindow({
    icon: getAssetsPath('icon.ico'),
    fullscreen: true,
    webPreferences: {
      devTools: true,
      preload: getPreloadPath('preload.js'), // 👈 Don't USE PRELOAD.JS IF YOUR USING NODE IN RENDERER PROCESS
      nodeIntegration: true,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
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
    console.error(`Failed to load: ${validatedURL} (${errorCode}) - ${errorDescription}`);
  });

  /* URLs OPEN IN DEFAULT BROWSER */
  mainWindow.webContents.setWindowOpenHandler((data) => {
    shell.openExternal(data.url);
    return { action: 'deny' };
  });

  mainWindow.on("closed", () => (mainWindow = null)); //창이 닫히면 변수 참조 해제(메모리 누수 방지)
  mainWindow.focus(); //창 생성 후 즉시 포커스(백그라운드로 가는 것 방지)
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
    const latestVersion = result?.updateInfo?.version;
    const currentVersion = app.getVersion();
    if (latestVersion && isVersionGreater(latestVersion, currentVersion)) {
      return { updateAvailable: true, version: latestVersion };
    } else {
      return { updateAvailable: false, version: latestVersion };
    }
  } catch (e) {
    let errorMessage = 'Unknown error';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return { updateAvailable: false, error: errorMessage };
  }
});

function isVersionGreater(v1: string, v2: string): boolean {
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

ipcMain.handle('download-update', async () => {
  return new Promise((resolve) => {
    if (progressBar) {
      // 이미 다운로드 중이면 무시
      resolve({ success: false, error: '이미 다운로드가 진행 중입니다.' });
      return;
    }

    progressBar = new ProgressBar({
      indeterminate: false,
      title: '업데이트 다운로드',
      text: '업데이트 준비 중...',
      detail: '잠시만 기다려주세요...',
      browserWindow: {
        parent: mainWindow!,
        modal: true,
        closable: false,
        minimizable: false,
        maximizable: false,
      },
      maxValue: 100,
    });

    // 다운로드 진행 이벤트
    autoUpdater.on('download-progress', (progressObj: { percent: number; transferred: number; total: number; }) => {
      if (!progressBar || progressBar.isCompleted()) return;

      const percent = Math.round(progressObj.percent);
      progressBar.value = percent;
      progressBar.detail = `다운로드 중... ${percent}% 완료 (${Math.round(progressObj.transferred / 1024)} KB / ${Math.round(progressObj.total / 1024)} KB)`;
    });

    autoUpdater.once('update-downloaded', () => {
      if (progressBar && !progressBar.isCompleted()) {
        progressBar.setCompleted();
        progressBar = null;
      }

      resolve({ success: true });
    });

    autoUpdater.once('error', (err: Error) => {
      if (progressBar) {
        progressBar.detail = '다운로드 중 오류 발생';
        progressBar.close();
        progressBar = null;
      }
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


// autoUpdater.checkForUpdatesAndNotify();

function isBlockmapNotFoundError(error: any): boolean {
  return error.message.includes('status 404') && error.message.includes('.blockmap');
}

app.whenReady().then(() => {
  setupDatabase();
  clearPendingInstaller();
  registerCmpIpc();
  registerSalesorgIpc();
  registerCornerIpc();
  registerProductIpc();
  registerOrderIpc();
  registerSaleOpenIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  if (process.argv.includes('--relaunch')) {
    const relaunchLogPath = path.join(app.getPath('userData'), 'relaunch.log');
    fs.appendFileSync(relaunchLogPath, `앱이 재실행됨 - ${new Date().toISOString()}\n`);
  }
});

//앱 종료 전 자원 정리
app.on('before-quit', async () => {
  console.log('before-quit: cleaning up...');
  try {
    await globalThis?.db?.close?.();
    if (globalThis.server) {
      await new Promise<void>((resolve) => {
        globalThis.server.close(() => {
          console.log('Server closed');
          resolve();
        });
      });
    }
    console.log('before-quit: cleanup done.');
  } catch (e) {
    console.error('Error during cleanup:', e);
  }
});
