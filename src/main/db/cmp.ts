import { ipcMain } from 'electron';
import { db } from './db';

export function registerCmpIpc() {
  ipcMain.handle('db:getCmpList', async () => {
    return db.prepare('SELECT * FROM cmp').all();
  });

  ipcMain.handle('db:addCmp', async (_e, cmp_cd, cmp_nm) => {
    db.prepare('INSERT INTO cmp (cmp_cd, cmp_nm) VALUES (?, ?) ON CONFLICT (cmp_cd) DO UPDATE SET cmp_nm = excluded.cmp_nm').run(cmp_cd, cmp_nm);
  });

  ipcMain.handle('db:updateCmp', async (_e, cmp_nm, cmp_cd) => {
    db.prepare('UPDATE cmp SET cmp_nm = ? WHERE cmp_cd = ?').run(cmp_nm, cmp_cd);
  });

  ipcMain.handle('db:deleteCmp', async (_e, cmp_cd) => {
    db.prepare('DELETE FROM cmp WHERE cmp_cd = ?').run(cmp_cd);
  });
}
