import { ipcMain } from 'electron';
import { db } from './db';
import camelcaseKeys from 'camelcase-keys';

type OrderHd = {
  saleDt: string;
  cmpCd: string;
  salesOrgCd: string;
  storCd: string;
  posNo: string;
  tradeNo: string;
  tradeDiv: string;
  ordTime: string;
  comTime: string;
  regDate: Date;
  updDate: Date;
  state: string;
  cornerCd: string;
  orderCornerList: OrderCorner[];
}

type OrderCorner = {
  cornerCd: string;
  orderNoC: string;
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
  setMenuCd:string;
  regDate: Date;
  updDate: Date;
  tradeDiv: string;
  cornerCd: string;
}


export function registerOrderIpc() {
  ipcMain.handle('db:getOrderList',
    async (e, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd) => {
    const rows = db.prepare(
      `SELECT
      hd.sale_dt, hd.order_no, hd.ord_time, hd.state,dt.item_plu_cd, dt.item_nm,
      dt.item_div, dt.sale_qty, cn.order_no_c, cn.state
      FROM order_hd hd
      JOIN order_dt dt
      ON hd.cmp_cd = dt.cmp_cd
      AND hd.sales_org_cd = dt.sales_org_cd
      AND hd.stor_cd = dt.stor_cd
      AND hd.sale_dt = dt.sale_dt
      AND hd.pos_no = dt.pos_no
      JOIN order_corner cn
      ON dt.cmp_cd = cn.cmp_cd
      AND dt.sales_org_cd = cn.sales_org_cd
      AND dt.stor_cd = cn.stor_cd
      AND dt.corner_cd = cn.corner_cd
      AND dt.sale_dt = cn.sale_dt
      AND dt.pos_no = cn.pos_no
      AND dt.sale_dt = ?
      AND dt.cmp_cd = ?
      AND dt.sales_org_cd = ?
      AND dt.stor_cd = ?
      AND dt.corner_cd = ?
      AND cn.state != '9'
      `
    ).all([sale_dt, cmp_cd, sales_org_cd, stor_cd,corner_cd]) as OrderHd[];
    return camelcaseKeys(rows, {deep: true})
    });

  ipcMain.handle('db:addOrderHd', async (_e,
   cmp_cd, sale_dt, sales_org_cd, stor_cd, pos_no, trade_no, trade_div, org_time, com_time, reg_date, upd_date, state) => {
    db.prepare(`INSERT INTO order_hd (cmp_cd, sale_dt, sales_org_cd, stor_cd, pos_no, trade_no, trade_div, org_time, com_time, reg_date, upd_date, state)
VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (cmp_cd, sale_dt, sales_org_cd, stor_cd, pos_no, trade_no)
DO UPDATE SET
    trade_div = excluded.trade_div,
    com_time = excluded.com_time,
    upd_date = excluded.upd_date,
    state = excluded.state`)
      .run(cmp_cd, sale_dt, sales_org_cd, stor_cd, pos_no, trade_no, trade_div, org_time, com_time, reg_date, upd_date, state)
  });

  ipcMain.handle('db:addOrderDt', async (_e,
   cmp_cd, sale_dt, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq, item_plu_cd, item_nm,
   item_div, sale_qty, order_no_c, set_menu_cd, trade_div, reg_date, upd_date) => {
    db.prepare(`INSERT INTO order_dt (cmp_cd, sale_dt, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq, item_plu_cd, item_nm, item_div, sale_qty, order_no_c, set_menu_cd, trade_div, reg_date, upd_date)
VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (cmp_cd, sale_dt, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq)
DO UPDATE SET
    sale_qty = excluded.sale_qty,
    trade_div = excluded.trade_div,
    upd_date = excluded.upd_date`)
      .run(cmp_cd, sale_dt, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq, item_plu_cd, item_nm, item_div, sale_qty, order_no_c, set_menu_cd, trade_div, reg_date, upd_date)
  });

  // ipcMain.handle('db:updateOrderDt', async (_e,
  //   cmp_cd, sale_dt, sales_org_cd, stor_cd, pos_no, trade_no, trade_div,upd_date,state) => {
  //   db.prepare('UPDATE order_hd SET soldout_yn = ? WHERE item_cd = ?').run(soldout_yn, item_cd);
  // })
}
