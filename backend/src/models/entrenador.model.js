import { pool } from '../config/database.js';

export async function buscarEntrenadorPorUsuario(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT e.id_entrenador, e.fk_usuario, u.nombre, u.apellido, u.correo
     FROM entrenador e
     INNER JOIN usuario u ON u.id_usuario = e.fk_usuario
     WHERE e.fk_usuario = ?
     LIMIT 1`,
    [idUsuario]
  );
  return filas[0] || null;
}

export async function buscarEntrenadorPorId(idEntrenador) {
  const [filas] = await pool.execute(
    `SELECT e.id_entrenador, e.fk_usuario, u.nombre, u.apellido, u.correo
     FROM entrenador e
     INNER JOIN usuario u ON u.id_usuario = e.fk_usuario
     WHERE e.id_entrenador = ?
     LIMIT 1`,
    [idEntrenador]
  );
  return filas[0] || null;
}

export async function listarEntrenadores({ soloActivos = true } = {}) {
  let sql = `
    SELECT e.id_entrenador, e.fk_usuario, u.nombre, u.apellido, u.correo, est.nombre_estado AS estado
    FROM entrenador e
    INNER JOIN usuario u ON u.id_usuario = e.fk_usuario
    INNER JOIN estado est ON est.id_estado = u.fk_estado
  `;

  if (soloActivos) {
    sql += " WHERE est.nombre_estado = 'Activo'";
  }

  sql += ' ORDER BY u.nombre ASC, u.apellido ASC';

  const [filas] = await pool.execute(sql);
  return filas;
}
