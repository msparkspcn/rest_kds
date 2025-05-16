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
    update: (cmp_nm: string, cmp_cd: string) =>
      ipcRenderer.invoke('db:updateCmp', cmp_nm, cmp_cd),
    delete: (cmp_cd: string) => ipcRenderer.invoke('db:deleteCmp', cmp_cd),
  },
  product: {
    getList: () => ipcRenderer.invoke('db:getProductList'),
    add: (  cmp_cd: string,
            sales_org_Cd: string,
            stor_cd: string,
            corner_cd: string,
            product_cd: string,
            product_nm: string,
            price: number,
            soldout_yn: string
    ) =>
      ipcRenderer.invoke('db:addProduct',
        cmp_cd, sales_org_Cd, stor_cd, corner_cd, product_cd, product_nm, price, soldout_yn)
  }
});
