import { ipcMain } from 'electron';
import { db } from './db';
import camelcaseKeys from 'camelcase-keys';

type SaleOpen = {
  cmpCd: string;
  sales_org_cd: string;
  stor_cd: string;
  sale_dt: string;
}

export function registerSaleOpenIpc() {
  ipcMain.handle('db:getSaleOpen', async (e, cmp_cd, sales_org_cd, stor_cd) => {
    const rows = db.prepare(
      `SELECT cmp_cd, sales_org_cd, stor_cd, sale_dt
              FROM sale_open
              where 1=1
              AND cmp_cd = ?
              AND sales_org_cd = ?
              AND stor_cd = ?
              `).get([cmp_cd, sales_org_cd, stor_cd]) as SaleOpen;
    return camelcaseKeys(rows, { deep: true });
  })

  ipcMain.handle('db:addSaleOpen', async (_e, cmp_cd, sales_org_cd, stor_cd, sale_dt) => {
    db.prepare(
      'INSERT OR IGNORE INTO sale_open (cmp_cd, sales_org_cd, stor_cd, sale_dt) VALUES (?, ?, ?, ?)'
    ).run(cmp_cd, sales_org_cd, stor_cd, sale_dt);
  });
}
