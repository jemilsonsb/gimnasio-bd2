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

export async function listarEntrenadores() {
  const [filas] = await pool.execute(
    `SELECT e.id_entrenador, e.fk_usuario, u.nombre, u.apellido, u.correo
     FROM entrenador e
     INNER JOIN usuario u ON u.id_usuario = e.fk_usuario
     ORDER BY u.nombre ASC, u.apellido ASC`
  );
  return filas;
}
