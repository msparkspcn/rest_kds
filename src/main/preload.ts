// eslint-disable-next-line import/no-extraneous-dependencies
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipc', {
  isElectron: true,
  platform: process.platform,
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
    ipcRenderer.send('app:quit');
  },
  log: (message: any) => ipcRenderer.send('log-to-file', message),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  cmp: {
    getList: () => ipcRenderer.invoke('db:getCmpList'),
    add: (cmp_cd: string, cmp_nm: string) =>
      ipcRenderer.invoke('db:addCmp', cmp_cd, cmp_nm),
    update: (cmp_nm: string, cmp_cd: string) =>
      ipcRenderer.invoke('db:updateCmp', cmp_nm, cmp_cd),
    delete: (cmp_cd: string) => ipcRenderer.invoke('db:deleteCmp', cmp_cd),
  },
  corner: {
    getList: (use_yn: string) => ipcRenderer.invoke('db:getCornerList', use_yn),
    getList2: (cmp_cd:string, sales_org_cd:string, stor_cd:string, use_yn: string) =>
      ipcRenderer.invoke('db:getCornerSummary', cmp_cd, sales_org_cd,stor_cd, use_yn),
    add: (  cmp_cd: string,
            sales_org_cd: string,
            stor_cd: string,
            corner_cd: string,
            corner_nm: string,
            use_yn: string
    ) =>
      ipcRenderer.invoke('db:addCorner',
        cmp_cd, sales_org_cd, stor_cd, corner_cd, corner_nm, use_yn)
  },
  product: {
    getList: (cmp_cd: string, sales_org_cd: string, stor_cd: string, corner_cd: string) =>
      ipcRenderer.invoke('db:getProductList', cmp_cd, sales_org_cd, stor_cd, corner_cd),
    // getList: () => ipcRenderer.invoke('db:getProductList'),
    add: (  cmp_cd: string,
            sales_org_Cd: string,
            stor_cd: string,
            corner_cd: string,
            item_cd: string,
            item_nm: string,
            price: number,
            soldout_yn: string,
            use_yn: string,
            sort_order: number
    ) =>
      ipcRenderer.invoke('db:addProduct',
        cmp_cd, sales_org_Cd, stor_cd, corner_cd, item_cd, item_nm, price, soldout_yn, use_yn, sort_order),
    updateSoldout: (item_cd: string, soldout_yn: string) => ipcRenderer.invoke('db:updateSoldout', item_cd, soldout_yn)
  }
});
