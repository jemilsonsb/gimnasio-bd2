import { pool } from '../config/database.js';

export async function listarEjercicios() {
  const [filas] = await pool.execute(
    `SELECT id_ejercicio, nombre_ejercicio, grupo_muscular, descripcion
     FROM ejercicio
     ORDER BY grupo_muscular ASC, nombre_ejercicio ASC`
  );
  return filas;
}

export async function buscarEjercicioPorId(idEjercicio) {
  const [filas] = await pool.execute(
    `SELECT id_ejercicio, nombre_ejercicio, grupo_muscular, descripcion
     FROM ejercicio
     WHERE id_ejercicio = ?
     LIMIT 1`,
    [idEjercicio]
  );
  return filas[0] || null;
}

export async function crearEjercicio({ nombre_ejercicio, grupo_muscular, descripcion = null }) {
  const [resultado] = await pool.execute(
    `INSERT INTO ejercicio (nombre_ejercicio, grupo_muscular, descripcion)
     VALUES (?, ?, ?)`,
    [nombre_ejercicio, grupo_muscular, descripcion]
  );

  return buscarEjercicioPorId(resultado.insertId);
}
