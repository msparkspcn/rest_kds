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
    getList: (cmp_cd: string) => ipcRenderer.invoke('db:getCmpList', cmp_cd),
    add: (cmp_cd: string, cmp_nm: string) =>
      ipcRenderer.invoke('db:addCmp', cmp_cd, cmp_nm),
    update: (cmp_nm: string, cmp_cd: string) =>
      ipcRenderer.invoke('db:updateCmp', cmp_nm, cmp_cd),
    delete: (cmp_cd: string) => ipcRenderer.invoke('db:deleteCmp', cmp_cd),
  },
  salesorg: {
    getList: (cmp_cd: string) => ipcRenderer.invoke('db:getSalesorgList', cmp_cd),
    add: (cmp_cd: string, sales_org_cd: string, sales_org_nm: string) =>
      ipcRenderer.invoke('db:addSalesorg', cmp_cd, sales_org_cd, sales_org_nm),
  },
  corner: {
    getList: (cmp_cd: string, sales_org_cd: string) => ipcRenderer.invoke('db:getCornerList', cmp_cd, sales_org_cd),
    getList2: (cmp_cd:string, sales_org_cd:string, stor_cd:string, use_yn:string) =>
      ipcRenderer.invoke('db:getCornerSummary', cmp_cd, sales_org_cd, stor_cd, use_yn),
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
  },

  order: {
    getHd: () => ipcRenderer.invoke('db:getHd'),
    getDt: () => ipcRenderer.invoke('db:getDt'),
    getList: (sale_dt: string, cmp_cd: string, sales_org_cd: string, stor_cd: string, corner_cd: string) =>
      ipcRenderer.invoke('db:getOrderList', sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd),
    getCompletedList: (sale_dt: string, cmp_cd: string, sales_org_cd: string, stor_cd: string, corner_cd: string) =>
      ipcRenderer.invoke('db:getCompletedOrderList', sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd),
    addOrderHd: (sale_dt:string, cmp_cd:string, sales_org_cd:string, stor_cd:string, corner_cd:string, pos_no:string,
                 trade_no:string, ord_time:string, com_time:string, status:string, order_no_c:string, upd_user_id:string, upd_date:Date) =>
      ipcRenderer.invoke('db:addOrderHd',
      sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no,
      trade_no, ord_time, com_time, status, order_no_c, upd_user_id, upd_date),
    addOrderDt: (sale_dt:string, cmp_cd:string, sales_org_cd:string, stor_cd:string, corner_cd:string, pos_no:string,
                 trade_no:string, seq:string, item_plu_cd:string, item_nm:string,
                 item_div:string, set_menu_cd:string, sale_qty:number) =>
      ipcRenderer.invoke('db:addOrderDt',
        sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no,
        trade_no, seq, item_plu_cd, item_nm, item_div, set_menu_cd, sale_qty),
    updateOrderStatus: (status:string, sale_dt:string, cmp_cd:string, sales_org_cd:string, stor_cd:string,
                        corner_cd:string, pos_no:string, trade_no:string, com_time:string) =>
      ipcRenderer.invoke('db:updateOrderStatus',
        status, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, com_time),
  },

  saleOpen: {
    getSaleOpen: (cmp_cd:string, sales_org_cd:string, stor_cd:string) =>
      ipcRenderer.invoke('db:getSaleOpen',
        cmp_cd, sales_org_cd, stor_cd),
    add: (cmp_cd:string, sales_org_cd:string, stor_cd:string, sale_dt:string) =>
      ipcRenderer.invoke('db:addSaleOpen',
        cmp_cd, sales_org_cd, stor_cd, sale_dt),
  }
});
