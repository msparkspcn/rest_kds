import { ipcMain } from 'electron';
import { db } from './db';

export function registerProductIpc() {
  ipcMain.handle('db:getProductList', async () => {
    return db.prepare(
      `SELECT
         c.corner_cd,
         c.corner_nm,
         p.product_cd,
         p.product_nm,
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
  });

  ipcMain.handle('db:addProduct', async (_e,
   cmp_cd, sales_org_cd, stor_cd, corner_cd, product_cd, product_nm, price, soldout_yn, use_yn) => {
    db.prepare(`INSERT INTO product (cmp_cd, sales_org_cd, stor_cd, corner_cd, product_cd, product_nm, price, soldout_yn, use_yn)
 VALUES (?, ?,?, ?,?, ?,?, ?, ?) ON CONFLICT (cmp_cd, sales_org_cd, stor_cd, corner_cd, product_cd)
 DO UPDATE SET
      product_nm = excluded.product_nm,
      price = excluded.price,
      soldout_yn = excluded.soldout_yn,
      use_yn = excluded.use_yn`)
      .run(cmp_cd, sales_org_cd, stor_cd, corner_cd, product_cd, product_nm, price, soldout_yn, use_yn);
  });

  ipcMain.handle('db:updateProduct', async (_e,soldout_yn, product_cd) => {
    db.prepare('UPDATE product SET soldout_yn = ? WHERE product_cd = ?').run(soldout_yn, product_cd)
  })
}
