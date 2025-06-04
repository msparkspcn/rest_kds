import { ipcMain } from 'electron';
import { db } from './db';
import camelcaseKeys from 'camelcase-keys';

type Product = {
  cmpCd: string;
  cornerCd: string;
  cornerNm: string;
  salesOrgCd: string;
  storCd: string;
  price: number;
  soldoutYn: string;
  itemCd: string;
  itemNm: string;
  sortOrder: number;
}


export function registerProductIpc() {
  ipcMain.handle('db:getProductList',
    async (e, cmp_cd,sales_org_cd,stor_cd,corner_cd) => {
    const rows = db.prepare(
      `SELECT
         c.corner_cd,
         c.corner_nm,
         p.item_cd,
         p.item_nm,
         p.price,
         p.soldout_yn,
         p.sort_order
       FROM corner c
       JOIN product p
         ON c.cmp_cd = p.cmp_cd
         AND c.sales_org_cd = p.sales_org_cd
         AND c.stor_cd = p.stor_cd
         AND c.corner_cd = p.corner_cd
         AND c.cmp_cd = ?
         AND c.sales_org_cd = ?
         AND c.stor_cd = ?
         AND c.corner_cd = ?
         ORDER BY p.sort_order
         `
    ).all([cmp_cd,sales_org_cd,stor_cd,corner_cd]) as Product[];
      return camelcaseKeys(rows, { deep: true });
  });

  ipcMain.handle('db:addProduct', async (_e,
   cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd, item_nm, price, soldout_yn, use_yn, sort_order) => {
    db.prepare(`INSERT INTO product (cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd, item_nm, price, soldout_yn, use_yn, sort_order)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd)
 DO UPDATE SET
      item_nm = excluded.item_nm,
      price = excluded.price,
      soldout_yn = excluded.soldout_yn,
      use_yn = excluded.use_yn,
      sort_order = excluded.sort_order`)
      .run(cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd, item_nm, price, soldout_yn, use_yn, sort_order);
  });

  ipcMain.handle('db:updateSoldout', async (_e,item_cd, soldout_yn) => {
    db.prepare('UPDATE product SET soldout_yn = ? WHERE item_cd = ?').run(soldout_yn, item_cd)
  })
}
