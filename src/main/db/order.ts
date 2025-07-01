import { ipcMain } from 'electron';
import { db } from './db';
import camelcaseKeys from 'camelcase-keys';

type Order = {
  saleDt: string;
  cmpCd: string;
  salesOrgCd: string;
  storCd: string;
  posNo: string;
  tradeNo: string;
  tradeDiv: string;
  ordTime: string;
  regDate: Date;
  updDate: Date;
  state: string;
  cornerCd: string;
  orderDtList: OrderDt[];
}

type OrderDt = {
  saleDt: string;
  cmpCd: string;
  salesOrgCd: string;
  storCd: string;
  posNo: string;
  tradeNo: string;
  seq: number;
  itemPluCd: string;
  itemNm: string;
  itemDiv: string;
  saleQty: number;
  orderNoC: string;
  setMenuCd:string;
  regDate: Date;
  updDate: Date;
  tradeDiv: string;
  cornerCd: string;
}


export function registerOrderIpc() {
  ipcMain.handle('db:getOrderList',
    async (e, cmp_cd, sales_org_cd, stor_cd, corner_cd) => {
    const rows = db.prepare(
      `SELECT
      hd.sale_dt, hd.order_no, hd.ord_time, hd.state,dt.item_plu_cd, dt.item_nm,
      dt.item_div, dt.sale_qty
      FROM order_hd hd
      JOIN order_dt dt
      ON hd.cmp_cd = dt.cmp_cd
      AND hd.sales_org_cd = dt.sales_org_cd
      AND hd.stor_cd = dt.stor_cd
      AND dt.cmp_cd = ?
      AND dt.sales_org_cd = ?
      AND dt.stor_cd = ?
      AND dt.corner_cd = ?
      `
    ).all([cmp_cd, sales_org_cd, stor_cd,corner_cd]) as Order[];
    return camelcaseKeys(rows, {deep: true})
    })
}
