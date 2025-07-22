import { ipcMain } from 'electron';
import camelcaseKeys from 'camelcase-keys';
import { db } from './db';

type Corner = {
  cmpCd: string;
  cornerCd: string;
  cornerNm: string;
  salesOrgCd: string;
  storCd: string;
  useYn: string;
};

type CornerSummary = {
  cmpCd: string;
  cornerCd: string;
  cornerNm: string;
  salesOrgCd: string;
  storCd: string;
  useYn: string;
  availableCount: string;
  soldoutCount: string;
};
export function registerCornerIpc() {
  ipcMain.handle('db:getCornerList', async (e, cmp_cd, sales_org_cd) => {
    const rows = db.prepare(
      `SELECT cmp_cd, sales_org_cd, stor_cd, corner_cd, corner_nm, use_yn
             FROM corner
             WHERE 1=1
             AND cmp_cd = ?
             AND sales_org_cd = ?`).all([cmp_cd, sales_org_cd]) as Corner[];
    return camelcaseKeys(rows, { deep: true });
  });

  ipcMain.handle('db:getCornerSummary', async (e, cmp_cd, sales_org_cd, stor_cd, use_yn) => {
    const rows = db
      .prepare(
        `
    SELECT
        c.cmp_cd,
        c.sales_org_cd,
        c.stor_cd,
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
    c.cmp_cd = ?
    AND c.sales_org_cd = ?
    AND c.stor_cd = ?
      AND c.use_yn = ?
    GROUP BY
      c.corner_cd, c.corner_nm
    ORDER BY
      c.corner_cd
      `,
      )
      .all([cmp_cd, sales_org_cd, stor_cd, use_yn]) as CornerSummary[];
    return camelcaseKeys(rows, { deep: true });
  });

  ipcMain.handle(
    'db:addCorner',
    async (_e, cmp_cd, sales_org_cd, stor_cd, corner_cd, corner_nm, use_yn) => {
      db.prepare(
        `INSERT INTO corner (cmp_cd, sales_org_cd, stor_cd, corner_cd, corner_nm, use_yn)
          VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(cmp_cd, sales_org_cd, stor_cd, corner_cd)
          DO UPDATE SET
            corner_nm = excluded.corner_nm,
            use_yn = excluded.use_yn`,
      ).run(cmp_cd, sales_org_cd, stor_cd, corner_cd, corner_nm, use_yn);
    },
  );

  ipcMain.handle('db:updateCorner', async (_e, cmp_nm, cmp_cd) => {
    db.prepare('UPDATE corner SET cmp_nm = ? WHERE cmp_cd = ?').run(cmp_nm, cmp_cd);
  });

  ipcMain.handle('db:deleteCorner', async (_e, cmp_cd) => {
    db.prepare('DELETE FROM corner WHERE cmp_cd = ?').run(cmp_cd);
  });
}
