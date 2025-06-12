/* eslint-disable import/no-extraneous-dependencies */
import { app } from 'electron';
// import installExtension, {
//   REACT_DEVELOPER_TOOLS,
//   REDUX_DEVTOOLS,
// } from 'electron-devtools-installer';
import path from 'path';
import os from 'os';
import { port } from '../../DevConfig.json';

const isDebug = process.env.ELECTRON_ENV === 'debug';

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';

// 안전하게 환경변수 접근 (괄호 포함된 키는 대괄호 표기법 사용)
function safeGetEnv(key: string): string | undefined {
  console.log(`os:${process.env[key]}`);
  return process.env[key];
}

function getAssetsPath(fileName: string) {
  if (safeGetEnv('NODE_ENV') === 'production' && app.isPackaged === true) {
    return path.resolve(process.resourcesPath, 'assets', fileName);
  }
  return path.resolve(__dirname, '../../../assets', fileName);
}

function getHtmlPath(htmlFileName: string) {
  const dev = safeGetEnv('NODE_ENV') === 'development';
  const result = dev
    ? `http://localhost:${port}`
    : `file://${path.join(__dirname, '../renderer', htmlFileName)}`;

  console.log(`🌍 getHtmlPath (${dev ? 'dev' : 'prod'}) →`, result);
  return result;
}

function getPreloadPath(Name: string) {
  if (safeGetEnv('NODE_ENV') === 'development') {
    return path.resolve(__dirname, '../../dist/main', Name);
  }
  return path.resolve(__dirname, Name);
}
let installExtension: any;
let REACT_DEVELOPER_TOOLS: any;
let REDUX_DEVTOOLS: any;

try {
  const devToolsInstaller = require('electron-devtools-installer');
  installExtension = devToolsInstaller.default ?? devToolsInstaller;
  REACT_DEVELOPER_TOOLS = devToolsInstaller.REACT_DEVELOPER_TOOLS;
  REDUX_DEVTOOLS = devToolsInstaller.REDUX_DEVTOOLS;
} catch (err) {
  console.error('Failed to load electron-devtools-installer:', err);
}

function installExtensions() {
  if (!installExtension) return;

  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
  extensions.forEach((Name) => {
    installExtension(Name)
      .then((name: string) => console.log(`${name} Extension Added`))
      .catch((err: Error) => console.error('Extension error:', err));
  });
}

export {
  isDebug,
  getAssetsPath,
  getHtmlPath,
  getPreloadPath,
  installExtensions,
  isWindows,
  isMac,
  isLinux,
};
