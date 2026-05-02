import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'echo_english',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function get(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

export async function run(sql, params = []) {
  const [result] = await pool.query(sql, params);
  return {
    insertId: result.insertId,
    affectedRows: result.affectedRows,
  };
}

export default pool;
