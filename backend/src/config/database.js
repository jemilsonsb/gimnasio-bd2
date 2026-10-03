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
  dateStrings: true,
  ...(environment.database.ssl ? { ssl: environment.database.ssl } : {})
});

// CURDATE() y NOW() usan la zona de la sesión; se fija hora de Colombia (sin horario de verano)
pool.on('connection', (conexion) => {
  conexion.query("SET time_zone = '-05:00'", (error) => {
    if (error) console.error('No se pudo fijar time_zone:', error.message);
  });
});
