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
         AND c.sales_org_Cd = p.sales_org_Cd
         AND c.stor_cd = p.stor_cd
         AND c.corner_cd = p.corner_cd
         AND c.cmp_cd = ?
         AND c.sales_org_Cd = ?
         AND c.stor_cd = ?
         AND c.corner_cd = ?
         `
    ).all();
  });

  ipcMain.handle('db:addProduct', async (_e,
   cmp_cd, sales_org_Cd, stor_cd, corner_cd, product_cd, product_nm, price, soldout_yn) => {
    db.prepare(`INSERT INTO cmp (cmp_cd, sales_org_Cd, stor_cd, corner_cd, product_cd, product_nm, price, soldout_yn)
 VALUES (?, ?,?, ?,?, ?,?, ?) ON CONFLICT (cmp_cd) DO UPDATE SET product_cd = excluded.product_cd`)
      .run(cmp_cd, sales_org_Cd, stor_cd, corner_cd, product_cd, product_nm, price, soldout_yn);
  });
}
