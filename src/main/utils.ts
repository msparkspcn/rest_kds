/* eslint-disable import/no-extraneous-dependencies */
import { app } from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';
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
  if (safeGetEnv('NODE_ENV') === 'production' && app.isPackaged === false) {
    return path.resolve(__dirname, '../../../assets', fileName);
  }
  return path.resolve(__dirname, '../../../assets', fileName);
}

function getHtmlPath(htmlFileName: string) {
  if (safeGetEnv('NODE_ENV') === 'development') {
    const url = `http://localhost:${port}`;
    return url;
  }
  return `file://${path.resolve(__dirname, `../renderer/${htmlFileName}`)}`;
}

function getPreloadPath(Name: string) {
  if (safeGetEnv('NODE_ENV') === 'development') {
    return path.resolve(__dirname, '../../dist/main', Name);
  }
  return path.resolve(__dirname, Name);
}

function installExtensions() {
  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
  extensions.forEach((Name) => {
    installExtension(Name) // eslint-disable-next-line no-console
      .then((name) => console.log(`${name} Extension Added`))
      // eslint-disable-next-line no-console
      .catch((err) => console.log('An error occurred: ', err));
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
