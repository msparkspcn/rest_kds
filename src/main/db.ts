import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// DB 파일 생성 경로 (Electron 앱 로컬 디렉터리 기준)
const dbPath = path.join(__dirname, 'app.db');

// DB 인스턴스 생성
const db = new Database(dbPath);

// 테이블 생성 함수
function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS cmp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cmp_cd TEXT NOT NULL,
      cmp_nm TEXT,
      useYn TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS salesorg (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cmp_cd TEXT NOT NULL,
      saler_org_cd TEXT NOT NULL,
      saler_org_nm TEXT,
      useYn TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS stor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cmp_cd TEXT NOT NULL,
      saler_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      stor_nm TEXT,
      useYn TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS corner (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cmp_cd TEXT NOT NULL,
      saler_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      corner_cd TEXT NOT NULL,
      corner_nm TEXT,
      useYn TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS kds_section (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cmp_cd TEXT NOT NULL,
      saler_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      corner_cd TEXT NOT NULL,
      section_cd TEXT NOT NULL,
      section_nm TEXT,
      sort_cd INTEGER,
      useYn TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS kds_section_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cmp_cd TEXT NOT NULL,
      saler_org_cd TEXT NOT NULL,
      stor_cd TEXT NOT NULL,
      corner_cd TEXT NOT NULL,
      section_cd TEXT NOT NULL,
      product_cd TEXT NOT NULL,
      product_nm TEXT,
      qty INTEGER,
      price REAL,
      soldout_yn TEXT
      useYn TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS order_hd (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

    );`,
    `CREATE TABLE IF NOT EXISTS order_dt (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

    );`,
    `CREATE TABLE IF NOT EXISTS sale_open (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
    );`
  ];

  db.transaction(() => {
    for (const query of tables) {
      db.prepare(query).run();
    }
  })();

  console.log('✅ All tables created.');
}

createTables();

export default db;
