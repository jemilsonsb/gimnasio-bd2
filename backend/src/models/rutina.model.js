import { pool } from '../config/database.js';

export async function buscarRutinaPorId(idRutina) {
  const [filas] = await pool.execute(
    `SELECT 
       r.id_rutina,
       r.nombre_rutina,
       r.objetivo,
       r.fecha_inicio,
       r.fecha_fin,
       r.estado,
       r.fk_cliente,
       c.codigo_miembro,
       c.fk_usuario AS id_usuario_cliente,
       CONCAT(uc.nombre, ' ', uc.apellido) AS nombre_cliente,
       uc.correo AS correo_cliente,
       r.fk_entrenador,
       e.fk_usuario AS id_usuario_entrenador,
       CONCAT(ue.nombre, ' ', ue.apellido) AS nombre_entrenador,
       ue.correo AS correo_entrenador
     FROM rutina r
     INNER JOIN cliente c ON c.id_cliente = r.fk_cliente
     INNER JOIN usuario uc ON uc.id_usuario = c.fk_usuario
     INNER JOIN entrenador e ON e.id_entrenador = r.fk_entrenador
     INNER JOIN usuario ue ON ue.id_usuario = e.fk_usuario
     WHERE r.id_rutina = ?
     LIMIT 1`,
    [idRutina]
  );
  return filas[0] || null;
}

export async function listarRutinas() {
  const [filas] = await pool.execute(
    `SELECT 
       r.id_rutina,
       r.nombre_rutina,
       r.objetivo,
       r.fecha_inicio,
       r.fecha_fin,
       r.estado,
       r.fk_cliente,
       c.codigo_miembro,
       c.fk_usuario AS id_usuario_cliente,
       CONCAT(uc.nombre, ' ', uc.apellido) AS nombre_cliente,
       uc.correo AS correo_cliente,
       r.fk_entrenador,
       e.fk_usuario AS id_usuario_entrenador,
       CONCAT(ue.nombre, ' ', ue.apellido) AS nombre_entrenador,
       ue.correo AS correo_entrenador
     FROM rutina r
     INNER JOIN cliente c ON c.id_cliente = r.fk_cliente
     INNER JOIN usuario uc ON uc.id_usuario = c.fk_usuario
     INNER JOIN entrenador e ON e.id_entrenador = r.fk_entrenador
     INNER JOIN usuario ue ON ue.id_usuario = e.fk_usuario
     ORDER BY r.id_rutina DESC`
  );
  return filas;
}

export async function listarRutinasPorCliente(idCliente) {
  const [filas] = await pool.execute(
    `SELECT 
       r.id_rutina,
       r.nombre_rutina,
       r.objetivo,
       r.fecha_inicio,
       r.fecha_fin,
       r.estado,
       r.fk_cliente,
       c.codigo_miembro,
       c.fk_usuario AS id_usuario_cliente,
       CONCAT(uc.nombre, ' ', uc.apellido) AS nombre_cliente,
       uc.correo AS correo_cliente,
       r.fk_entrenador,
       e.fk_usuario AS id_usuario_entrenador,
       CONCAT(ue.nombre, ' ', ue.apellido) AS nombre_entrenador,
       ue.correo AS correo_entrenador
     FROM rutina r
     INNER JOIN cliente c ON c.id_cliente = r.fk_cliente
     INNER JOIN usuario uc ON uc.id_usuario = c.fk_usuario
     INNER JOIN entrenador e ON e.id_entrenador = r.fk_entrenador
     INNER JOIN usuario ue ON ue.id_usuario = e.fk_usuario
     WHERE r.fk_cliente = ?
     ORDER BY r.id_rutina DESC`,
    [idCliente]
  );
  return filas;
}

export async function crearRutina({
  fk_cliente,
  fk_entrenador,
  nombre_rutina,
  objetivo = null,
  fecha_inicio = null,
  fecha_fin = null,
  estado = 'Activa'
}) {
  const [resultado] = await pool.execute(
    `INSERT INTO rutina (fk_cliente, fk_entrenador, nombre_rutina, objetivo, fecha_inicio, fecha_fin, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fk_cliente, fk_entrenador, nombre_rutina, objetivo, fecha_inicio, fecha_fin, estado]
  );
  return buscarRutinaPorId(resultado.insertId);
}

export async function agregarDetalleRutina({
  fk_rutina,
  fk_ejercicio,
  dia_semana,
  series,
  repeticiones,
  descanso_segundos = null
}) {
  const [resultado] = await pool.execute(
    `INSERT INTO detalle_rutina (fk_rutina, fk_ejercicio, dia_semana, series, repeticiones, descanso_segundos)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fk_rutina, fk_ejercicio, dia_semana, series, repeticiones, descanso_segundos]
  );

  const [filas] = await pool.execute(
    `SELECT 
       dr.id_detalle,
       dr.fk_rutina,
       dr.fk_ejercicio,
       dr.dia_semana,
       dr.series,
       dr.repeticiones,
       dr.descanso_segundos,
       ej.nombre_ejercicio,
       ej.grupo_muscular,
       ej.descripcion AS descripcion_ejercicio
     FROM detalle_rutina dr
     INNER JOIN ejercicio ej ON ej.id_ejercicio = dr.fk_ejercicio
     WHERE dr.id_detalle = ?
     LIMIT 1`,
    [resultado.insertId]
  );
  return filas[0];
}

export async function listarDetallesRutina(idRutina) {
  const [filas] = await pool.execute(
    `SELECT 
       dr.id_detalle,
       dr.fk_rutina,
       dr.fk_ejercicio,
       dr.dia_semana,
       dr.series,
       dr.repeticiones,
       dr.descanso_segundos,
       ej.nombre_ejercicio,
       ej.grupo_muscular,
       ej.descripcion AS descripcion_ejercicio
     FROM detalle_rutina dr
     INNER JOIN ejercicio ej ON ej.id_ejercicio = dr.fk_ejercicio
     WHERE dr.fk_rutina = ?
     ORDER BY dr.dia_semana ASC, dr.id_detalle ASC`,
    [idRutina]
  );
  return filas;
}
