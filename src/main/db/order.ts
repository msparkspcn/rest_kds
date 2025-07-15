import { ipcMain } from 'electron';
import { db } from './db';
import camelcaseKeys from 'camelcase-keys';

type OrderHd = {
  saleDt: string;
  cmpCd: string;
  salesOrgCd: string;
  storCd: string;
  cornerCd: string;
  posNo: string;
  tradeNo: string;
  ordTime: string;
  comTime: string;
  status: string;
  orderNoC: string;
  updUserId: string;
  updDate: Date;
  orderDtList: OrderDt[];
}

type CompletedOrder = {
  posNo: string;
  orderNoC: string;
  ordTime: string;
  comTime: string;
  seq: number;
  itemNm: string;
  saleQty: number;
  status: string;
  itemDiv: string;
  setMenuCd: string;
}

type OrderDt = {
  saleDt: string;
  cmpCd: string;
  salesOrgCd: string;
  storCd: string;
  cornerCd: string;
  posNo: string;
  tradeNo: string;
  seq: number;
  itemPluCd: string;
  itemNm: string;
  itemDiv: string;
  setMenuCd:string;
  saleQty: number;
}


export function registerOrderIpc() {
  ipcMain.handle('db:getHd',
    async (e) => {
    const rows = db.prepare(
      `SELECT *
      FROM order_hd
      `
    ).all() as OrderHd[];
      return camelcaseKeys(rows, {deep: true})
    });

  ipcMain.handle('db:getOrderList',
    async (e, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd) => {
    const rows = db.prepare(
      `SELECT
      hd.sale_dt, hd.ord_time, hd.status, hd.order_no_c, dt.seq, dt.item_plu_cd, dt.item_nm,
      dt.item_div, dt.corner_cd, dt.sale_qty
      FROM order_hd hd
      JOIN order_dt dt
      ON hd.cmp_cd = dt.cmp_cd
      AND hd.sales_org_cd = dt.sales_org_cd
      AND hd.stor_cd = dt.stor_cd
      AND hd.corner_cd = dt.corner_cd
      AND hd.sale_dt = dt.sale_dt
      AND hd.pos_no = dt.pos_no
      WHERE 1=1
      AND dt.sale_dt = ?
      AND dt.cmp_cd = ?
      AND dt.sales_org_cd = ?
      AND dt.stor_cd = ?
      AND dt.corner_cd = ?
      AND hd.status not in ('8','9')
      `
    ).all([sale_dt, cmp_cd, sales_org_cd, stor_cd,corner_cd]) as OrderHd[];
    return camelcaseKeys(rows, {deep: true})
    });

  ipcMain.handle('db:getCompletedOrderList',
    async(e,sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd) => {
    const rows = db.prepare(
      `SELECT
      hd.pos_no, hd.order_no_c, hd.ord_time, hd.com_time, seq, item_plu_cd, item_nm, sale_qty, hd.status,
      item_div, set_menu_cd
      FROM order_hd hd
      JOIN order_dt dt
      ON dt.cmp_cd = hd.cmp_cd
      AND dt.sales_org_cd = hd.sales_org_cd
      AND dt.stor_cd = hd.stor_cd
      AND dt.corner_cd = hd.corner_cd
      AND dt.sale_dt = hd.sale_dt
      AND dt.pos_no = hd.pos_no
      AND dt.trade_no = hd.trade_no
      WHERE 1=1
      AND dt.sale_dt = ?
      AND dt.cmp_cd = ?
      AND dt.sales_org_cd = ?
      AND dt.stor_cd = ?
      AND dt.corner_cd = ?
      AND cn.status = '9'
      `
    ).all([sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd]) as CompletedOrder[];
    return camelcaseKeys(rows, {deep: true})
    });

  ipcMain.handle('db:addOrderHd', async (_e,
   sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no,
   org_time, com_time, status, order_no_c, upd_user_id, upd_date) => {
    db.prepare(`INSERT INTO order_hd
(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no,
org_time, com_time, status, order_no_c, upd_user_id, upd_date)
VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT (sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no)
DO UPDATE SET
    org_time = excluded.org_time,
    com_time = excluded.com_time,
    status = excluded.status,
    order_no_c = excluded.order_no_c,
    upd_user_id = excluded.upd_user_id,
    upd_date = excluded.upd_date`)
      .run(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no,
        org_time, com_time, status, order_no_c, upd_user_id, upd_date)
  });

  ipcMain.handle('db:addOrderDt', async (_e,
   sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq, item_plu_cd, item_nm,
   item_div, set_menu_cd, sale_qty) => {
    db.prepare(`INSERT INTO order_dt
(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq, item_plu_cd, item_nm,
item_div, set_menu_cd, sale_qty)
VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
ON CONFLICT (sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq)
DO UPDATE SET
    sale_qty = excluded.sale_qty,
    trade_div = excluded.trade_div,
    upd_date = excluded.upd_date`)
      .run(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq, item_plu_cd, item_nm,
        item_div, set_menu_cd, sale_qty)
  });

  ipcMain.handle('db:updateOrderStatus', async (_e,
                                                status, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no) => {
    db.prepare(`UPDATE order_hd
            SET status = ?
            WHERE
            sale_dt = ?
            and cmp_cd = ?
            and sales_org_cd = ?
            and stor_cd = ?
            and corner_cd = ?
            and pos_no = ?
            and trade_no = ?`)
      .run(status, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no);
  })
}
