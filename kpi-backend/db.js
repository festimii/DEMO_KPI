import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST, // e.g. "192.168.1.100"
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // true for Azure, false for local
    enableArithAbort: true,
  },
};

export async function queryDatabase(query, params = {}) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    for (const key in params) {
      request.input(key, params[key]);
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}
