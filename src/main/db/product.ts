import { ipcMain } from 'electron';
import { db } from './db';
import camelcaseKeys from 'camelcase-keys';

export function registerProductIpc() {
  ipcMain.handle('db:getProductList', async () => {
    const rows = db.prepare(
      `SELECT
         c.corner_cd,
         c.corner_nm,
         p.item_cd,
         p.item_nm,
         p.price,
         p.soldout_yn
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
         `
    ).all();
    const camelized = camelcaseKeys(rows, { deep: true });

    return camelized;
  });

  ipcMain.handle('db:addProduct', async (_e,
   cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd, item_nm, price, soldout_yn, use_yn) => {
    db.prepare(`INSERT INTO product (cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd, item_nm, price, soldout_yn, use_yn)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd)
 DO UPDATE SET
      item_nm = excluded.item_nm,
      price = excluded.price,
      soldout_yn = excluded.soldout_yn,
      use_yn = excluded.use_yn`)
      .run(cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd, item_nm, price, soldout_yn, use_yn);
  });

  ipcMain.handle('db:updateSoldout', async (_e,soldout_yn, item_cd) => {
    db.prepare('UPDATE product SET soldout_yn = ? WHERE item_cd = ?').run(soldout_yn, item_cd)
  })
}
