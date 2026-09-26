import { pool } from '../config/database.js';

export async function listarClientes({ soloActivos = true } = {}) {
  let sql = `
    SELECT 
      c.id_cliente,
      c.codigo_miembro,
      c.fecha_nacimiento,
      c.contacto_emergencia,
      u.id_usuario,
      u.nombre,
      u.apellido,
      u.correo,
      u.documento_identidad,
      u.telefono,
      e.nombre_estado AS estado
    FROM cliente c
    INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
    INNER JOIN estado e ON e.id_estado = u.fk_estado
  `;

  const params = [];
  if (soloActivos) {
    sql += " WHERE e.nombre_estado = 'Activo'";
  }

  sql += ' ORDER BY u.nombre ASC, u.apellido ASC';

  const [filas] = await pool.execute(sql, params);
  return filas;
}

export async function buscarClientePorId(idCliente) {
  const [filas] = await pool.execute(
    `SELECT 
       c.id_cliente,
       c.codigo_miembro,
       c.fecha_nacimiento,
       c.contacto_emergencia,
       u.id_usuario,
       u.nombre,
       u.apellido,
       u.correo,
       u.documento_identidad,
       u.telefono,
       e.nombre_estado AS estado
     FROM cliente c
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN estado e ON e.id_estado = u.fk_estado
     WHERE c.id_cliente = ?
     LIMIT 1`,
    [idCliente]
  );

  return filas[0] || null;
}