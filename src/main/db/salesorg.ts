import { ipcMain } from 'electron';
import { db } from './db';

export function registerSalesorgIpc() {
  ipcMain.handle('db:getSalesorgList', async (e, cmp_cd) => {
    return db.prepare(
      `SELECT cmp_cd, sales_org_cd, sales_org_nm
              FROM salesorg
              where 1=1
              AND cmp_cd = ?`).all([cmp_cd]);
  });

  ipcMain.handle('db:addSalesorg', async (_e, cmp_cd, sales_org_cd, sales_org_nm) => {
    db.prepare(
      'INSERT INTO salesorg (cmp_cd, sales_org_cd, sales_org_nm) VALUES (?, ?, ?) ON CONFLICT (cmp_cd, sales_org_cd) DO UPDATE SET sales_org_nm = excluded.sales_org_nm'
    ).run(cmp_cd, sales_org_cd, sales_org_nm);
  });

}
