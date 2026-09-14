import mysql from 'mysql2/promise';
import { environment } from './environment.js';

export const pool = mysql.createPool({
  host: environment.database.host,
  port: environment.database.port,
  database: environment.database.name,
  user: environment.database.user,
  password: environment.database.password,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});
