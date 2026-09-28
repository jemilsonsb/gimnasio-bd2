import { pool } from '../config/database.js';

export async function listarClases() {
  const [filas] = await pool.execute(
    `SELECT id_clase, nombre_clase, descripcion, capacidad_maxima
     FROM clase
     ORDER BY nombre_clase ASC`
  );
  return filas;
}

export async function buscarClasePorId(idClase) {
  const [filas] = await pool.execute(
    `SELECT id_clase, nombre_clase, descripcion, capacidad_maxima
     FROM clase
     WHERE id_clase = ?
     LIMIT 1`,
    [idClase]
  );
  return filas[0] || null;
}

export async function crearClase({ nombre_clase, descripcion = null, capacidad_maxima }) {
  const [resultado] = await pool.execute(
    `INSERT INTO clase (nombre_clase, descripcion, capacidad_maxima)
     VALUES (?, ?, ?)`,
    [nombre_clase, descripcion, capacidad_maxima]
  );
  return buscarClasePorId(resultado.insertId);
}
