// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipc', {
  /*  ELECTRON IPC APIs */
  send(channel: string, args: unknown) {
    ipcRenderer.send(channel, args);
  },
  receive(channel: string, callBack: (...args: unknown[]) => void) {
    ipcRenderer.once(channel, (_event, ...args) => {
      callBack(...args);
    });
  },
  /* ELECTRON STORE APIs */
  set(key: string, val: unknown) {
    ipcRenderer.send('set', key, val);
  },
  get(key: string) {
    return ipcRenderer.sendSync('get', key);
  },

  quitApp: () => {
    ipcRenderer.send('app:quit')
  },

  cmp: {
    getList: () => ipcRenderer.invoke('db:getCmpList'),
    add: (cmp_cd: string, cmp_nm: string) =>
      ipcRenderer.invoke('db:addCmp', cmp_cd, cmp_nm),
    update: (cmp_cd: string, cmp_nm: string) =>
      ipcRenderer.invoke('db:updateCmp', cmp_nm, cmp_cd),
    delete: (cmp_cd: string) => ipcRenderer.invoke('db:deleteCmp', cmp_cd),
  },
});
