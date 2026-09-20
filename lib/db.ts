import mysql, { Pool } from "mysql2/promise";

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

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS registrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,
          registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .then(() => undefined);
  }
  return schemaReady;
}

export default pool;
