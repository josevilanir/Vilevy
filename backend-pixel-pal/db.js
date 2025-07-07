import { Pool } from 'pg';

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = 'postgres',
  DB_PASS = 'postgres',
  DB_NAME = 'pixelpal',
} = process.env;

export const pool = new Pool({
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});
