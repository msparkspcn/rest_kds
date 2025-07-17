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

type RecentCompletedOrderHd = {
  posNo: string;
  tradeNo: string;
}


export function registerOrderIpc() {
  ipcMain.handle('db:getHd',
    async (e) => {
    const rows = db.prepare(
      `SELECT *
      FROM order_hd
      `
    ).all() as OrderHd[];
    console.log("rows from db:", rows);
      return camelcaseKeys(rows, {deep: true})
    });

  ipcMain.handle('db:getDt',
    async (e) => {
      const rows = db.prepare(
        `SELECT *
      FROM order_dt
      `
      ).all() as OrderDt[];
      console.log("rows from db:", rows);
      return camelcaseKeys(rows, {deep: true})
    });

  ipcMain.handle('db:getOrderList',
    async (e,
           sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd) => {
    const orderHdRows = db.prepare(
      `SELECT cmp_cd, sales_org_cd, stor_cd, corner_cd, sale_dt, pos_no, trade_no, ord_time, status,order_no_c
      FROM order_hd
      WHERE 1=1
      AND sale_dt = ?
      AND cmp_cd = ?
      AND sales_org_cd = ?
      AND stor_cd = ?
      AND corner_cd = ?
      AND status not in ('5', '8','9')
      `).all([sale_dt, cmp_cd, sales_org_cd, stor_cd,corner_cd]) as OrderHd[];
      console.log("orderHdRows from db:", orderHdRows);
    const orderDtRows = db.prepare(
      `SELECT cmp_cd, sales_org_cd, stor_cd, corner_cd, sale_dt, pos_no, trade_no,
seq, item_plu_cd,item_nm,item_div,set_menu_cd,sale_qty
      FROM order_dt
      WHERE 1=1
      AND sale_dt = ?
      AND cmp_cd = ?
      AND sales_org_cd = ?
      AND stor_cd = ?
      AND corner_cd = ?
      `).all([sale_dt, cmp_cd, sales_org_cd, stor_cd,corner_cd]) as OrderDt[];
      console.log("orderDtRows from db:", orderDtRows);
    const orderHdList = camelcaseKeys(orderHdRows, { deep: true });
      const orderDtList = camelcaseKeys(orderDtRows, { deep: true });

      const result = orderHdList.map((hd) => {
        const orderDtListForHd = orderDtList.filter(dt =>
          dt.saleDt === hd.saleDt &&
          dt.cmpCd === hd.cmpCd &&
          dt.salesOrgCd === hd.salesOrgCd &&
          dt.storCd === hd.storCd &&
          dt.cornerCd === hd.cornerCd &&
          dt.posNo === hd.posNo &&
          dt.tradeNo === hd.tradeNo
        );
        return {
          ...hd,
          orderDtList: orderDtListForHd
        };
      });
      return result;
    });

  ipcMain.handle('db:getCompletedOrderList',
    async(e,sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd) => {
      const orderHdRows = db.prepare(
        `SELECT cmp_cd, sales_org_cd, stor_cd, corner_cd, sale_dt, pos_no, trade_no, ord_time, com_time, status,order_no_c
      FROM order_hd
      WHERE 1=1
      AND sale_dt = ?
      AND cmp_cd = ?
      AND sales_org_cd = ?
      AND stor_cd = ?
      AND corner_cd = ?
      AND status = '5'
      `).all([sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd]) as OrderHd[];
      const orderDtRows = db.prepare(
        `SELECT cmp_cd, sales_org_cd, stor_cd, corner_cd, sale_dt, pos_no, trade_no,
seq, item_plu_cd,item_nm,item_div,set_menu_cd,sale_qty
      FROM order_dt
      WHERE 1=1
      AND sale_dt = ?
      AND cmp_cd = ?
      AND sales_org_cd = ?
      AND stor_cd = ?
      AND corner_cd = ?
      `).all([sale_dt, cmp_cd, sales_org_cd, stor_cd,corner_cd]) as OrderDt[];

      const orderHdList = camelcaseKeys(orderHdRows, { deep: true });
      const orderDtList = camelcaseKeys(orderDtRows, { deep: true });

      const result = orderHdList.map((hd) => {
        const orderDtListForHd = orderDtList.filter(dt =>
          dt.saleDt === hd.saleDt &&
          dt.cmpCd === hd.cmpCd &&
          dt.salesOrgCd === hd.salesOrgCd &&
          dt.storCd === hd.storCd &&
          dt.cornerCd === hd.cornerCd &&
          dt.posNo === hd.posNo &&
          dt.tradeNo === hd.tradeNo
        );
        return {
          ...hd,
          orderDtList: orderDtListForHd
        };
      });
      return result;
    });

  ipcMain.handle('db:getRecentCompletedOrder',
    async (_e, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd) => {
    const rows = db.prepare(
      `SELECT pos_no, trade_no
FROM order_hd
WHERE 1=1
      AND sale_dt = ?
      AND cmp_cd = ?
      AND sales_org_cd = ?
      AND stor_cd = ?
      AND corner_cd = ?
      AND status = '5'
      AND com_time is not null
      ORDER BY com_time DESC
      LIMIT 1
      `).get([sale_dt, cmp_cd, sales_org_cd, stor_cd,corner_cd]) as RecentCompletedOrderHd;
    console.log("rows from db:", rows);
    return camelcaseKeys(rows, {deep: true})
    }
  )

  ipcMain.handle('db:addOrderHd', async (_e,
   sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no,
   ord_time, com_time, status, order_no_c, upd_user_id, upd_date) => {
    db.prepare(`INSERT INTO order_hd
(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no,
ord_time, com_time, status, order_no_c, upd_user_id, upd_date)
VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
ON CONFLICT (sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no)
DO UPDATE SET
    ord_time = excluded.ord_time,
    com_time = excluded.com_time,
    status = excluded.status,
    order_no_c = excluded.order_no_c,
    upd_user_id = excluded.upd_user_id,
    upd_date = excluded.upd_date`)
      .run(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no,
        ord_time, com_time, status, order_no_c, upd_user_id, upd_date)
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
    item_plu_cd = excluded.item_plu_cd,
    item_nm = excluded.item_nm,
    item_div = excluded.item_div,
    set_menu_cd = excluded.set_menu_cd,
    sale_qty = excluded.sale_qty`)
      .run(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq, item_plu_cd, item_nm,
        item_div, set_menu_cd, sale_qty)
  });

  ipcMain.handle('db:updateOrderStatus', async (_e,
    status, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, com_time) => {
    let stmt: any;
    let params: any[];
    if (com_time) {
      stmt = db.prepare(`
      UPDATE order_hd
      SET status = ?, com_time = ?
      WHERE sale_dt = ?
        AND cmp_cd = ?
        AND sales_org_cd = ?
        AND stor_cd = ?
        AND corner_cd = ?
        AND pos_no = ?
        AND trade_no = ?
    `);
      params = [status, com_time, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no];
    } else {
      stmt = db.prepare(`
      UPDATE order_hd
      SET status = ?
      WHERE sale_dt = ?
        AND cmp_cd = ?
        AND sales_org_cd = ?
        AND stor_cd = ?
        AND corner_cd = ?
        AND pos_no = ?
        AND trade_no = ?
    `);
      params = [status, sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no];
    }

    stmt.run(...params);

    return { success: true };
  })
}
