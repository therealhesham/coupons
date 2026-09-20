import mysql, { Pool } from "mysql2/promise";
import bcrypt from "bcryptjs";

declare global {
  var _mysqlPool: Pool | undefined;
}

function createPool(): Pool {
  return mysql.createPool({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "coupons",
    waitForConnections: true,
    connectionLimit: 10,
  });
}

const pool = global._mysqlPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global._mysqlPool = pool;
}

let schemaReady: Promise<void> | null = null;

async function seedInitialAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  const [rows] = await pool.query("SELECT id FROM admin_users LIMIT 1");
  if ((rows as unknown[]).length > 0) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
    [username, passwordHash]
  );
}

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS registrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      );

      await pool.query(
        `CREATE TABLE IF NOT EXISTS admin_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      );

      await pool.query(
        `CREATE TABLE IF NOT EXISTS sectors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      );

      await pool.query(
        `CREATE TABLE IF NOT EXISTS coupons (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(64) NOT NULL UNIQUE,
          title VARCHAR(255) NOT NULL,
          discount_percent INT NOT NULL,
          applies_to_all_sectors BOOLEAN NOT NULL DEFAULT FALSE,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      );

      await pool.query(
        `CREATE TABLE IF NOT EXISTS coupon_sectors (
          coupon_id INT NOT NULL,
          sector_id INT NOT NULL,
          PRIMARY KEY (coupon_id, sector_id),
          FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
          FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE
        )`
      );

      await seedInitialAdmin();
    })();
  }
  return schemaReady;
}

export default pool;
