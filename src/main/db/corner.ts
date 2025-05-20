import { ipcMain } from 'electron';
import { db } from './db';
import camelcaseKeys from 'camelcase-keys';

export function registerCornerIpc() {
  ipcMain.handle('db:getCornerList', async (e, use_yn) => {
    const rows = db.prepare('SELECT * FROM corner where use_yn = ?').all([use_yn]);
    const camelized = camelcaseKeys(rows, { deep: true });

    return camelized;
  });

  ipcMain.handle('db:getCornerSummary', async (e, use_yn) => {
    const rows = db.prepare(`
    SELECT
      c.corner_cd,
      c.corner_nm,
      COUNT(CASE WHEN p.soldout_yn = '0' THEN 1 END) AS available_count,
      COUNT(CASE WHEN p.soldout_yn != '0' THEN 1 END) AS soldout_count
    FROM
      corner c
    LEFT JOIN
      product p
    ON
      c.cmp_cd = p.cmp_cd
      AND c.sales_org_cd = p.sales_org_cd
      AND c.stor_cd = p.stor_cd
      AND c.corner_cd = p.corner_cd
    WHERE
      c.use_yn = ?
    GROUP BY
      c.corner_cd, c.corner_nm
    ORDER BY
      c.corner_cd
      `).all([use_yn]);
    const camelized = camelcaseKeys(rows, { deep: true });

    return camelized;
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
