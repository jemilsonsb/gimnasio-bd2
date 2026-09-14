import 'dotenv/config';

export const environment = {
  port: Number(process.env.PORT || 3000),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'gimnasio_bd2',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'clave-local-no-usar-en-produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  }
};
