import mysql from "mysql2/promise";

export async function getConnection() {
  const isLocal = process.env.DB_HOST === "localhost";
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: true } }),
  });
}
