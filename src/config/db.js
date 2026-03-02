const mysql = require('mysql2/promise');

// Support both MYSQL_* env names and DB_* (used in .env / some providers)
const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const port = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);
const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
const password = process.env.MYSQLPASSWORD || process.env.DB_PASS || process.env.DB_PASSWORD || '';
const database = process.env.MYSQLDATABASE || process.env.DB_NAME || process.env.MYSQL_DATABASE || '';

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
