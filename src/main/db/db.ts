import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// DB 파일 생성 경로 (Electron 앱 로컬 디렉터리 기준)
const dbPath = path.join(app.getPath('userData'), 'data.sqlite');

// DB 인스턴스 생성
const db = new Database(dbPath);

// 테이블 생성 함수
function createTables() {
  console.log('Starting to create tables...');

  const tables = [
    `CREATE TABLE IF NOT EXISTS cmp (
      cmp_cd TEXT PRIMARY KEY,
      cmp_nm TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS salesorg (
      cmp_cd TEXT NOT NULL,
      sales_org_cd TEXT NOT NULL,
      sales_org_nm TEXT,
      useYn TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS stor (
      cmp_cd TEXT NOT NULL,
      sales_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      stor_nm TEXT,
      useYn TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS corner (
      cmp_cd TEXT NOT NULL,
      sales_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      corner_cd TEXT NOT NULL,
      corner_nm TEXT,
      use_yn TEXT,
      PRIMARY KEY (cmp_cd, sales_org_cd, stor_cd, corner_cd)
    );`,

    `CREATE TABLE IF NOT EXISTS product (
      cmp_cd TEXT NOT NULL,
      sales_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      corner_cd TEXT NOT NULL,
      item_cd TEXT NOT NULL,
      item_nm TEXT,
      price REAL,
      soldout_yn TEXT,
      use_yn TEXT,
      sort_order REAL,
       PRIMARY KEY (cmp_cd, sales_org_cd, stor_cd, corner_cd, item_cd)
    );`,

    `CREATE TABLE IF NOT EXISTS order_hd (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_dt TEXT NOT NULL,
      cmp_cd TEXT NOT NULL,
      sales_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      corner_cd TEXT NOT NULL,
      pos_no TEXT NOT NULL,
      trade_no TEXT NOT NULL,
      ord_time TEXT,
      com_time TEXT,
      status TEXT,
      order_no_c TEXT,
      upd_user_id TEXT,
      upd_date TEXT,
      UNIQUE(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no)
    );`,

    `CREATE TABLE IF NOT EXISTS order_dt (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_dt TEXT NOT NULL,
      cmp_cd TEXT NOT NULL,
      sales_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      corner_cd TEXT NOT NULL,
      pos_no TEXT NOT NULL,
      trade_no TEXT NOT NULL,
      seq INTEGER NOT NULL,
      item_plu_cd TEXT,
      item_nm TEXT,
      item_div TEXT,
      set_menu_cd TEXT,
      sale_qty INTEGER,
      UNIQUE(sale_dt, cmp_cd, sales_org_cd, stor_cd, corner_cd, pos_no, trade_no, seq)
    );`,

    `CREATE TABLE IF NOT EXISTS sale_open (
      cmp_CD TEXT NOT NULL,
      sales_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      dt TEXT NOT NULL
    );`,
  ];

  tables.forEach((query) => {
    db.prepare(query).run();
    console.log('Table created or already exists.');
  });

  console.log('✅ All tables created.');
  console.log('Database will be created at:', dbPath);
}

createTables();

export { db, createTables };
