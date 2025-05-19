import { ipcMain } from 'electron';
import { db } from './db';

export function registerCornerIpc() {
  ipcMain.handle('db:getCornerList', async () => {
    return db.prepare('SELECT * FROM corner').all();
  });

  ipcMain.handle('db:addCorner', async (_e, cmp_cd, sales_org_cd, stor_cd, corner_cd, corner_nm, use_yn) => {
    db.prepare(`INSERT INTO corner (cmp_cd, sales_org_cd, stor_cd, corner_cd, corner_nm, use_yn)
          VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(cmp_cd, sales_org_cd, stor_cd, corner_cd)
          DO UPDATE SET
            corner_nm = excluded.corner_nm,
            use_yn = excluded.use_yn`)
      .run(cmp_cd, sales_org_cd, stor_cd, corner_cd, corner_nm, use_yn);
  });

  ipcMain.handle('db:updateCorner', async (_e, cmp_nm, cmp_cd) => {
    db.prepare('UPDATE corner SET cmp_nm = ? WHERE cmp_cd = ?').run(cmp_nm, cmp_cd);
  });

  ipcMain.handle('db:deleteCorner', async (_e, cmp_cd) => {
    db.prepare('DELETE FROM corner WHERE cmp_cd = ?').run(cmp_cd);
  });
}
