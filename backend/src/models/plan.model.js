import { pool } from '../config/database.js';

export async function listarPlanes({ soloActivos = true } = {}) {
  let sql = `
    SELECT id_plan, nombre_plan, descripcion, duracion_dias, precio, ingresos_incluidos, activo, creado_en, actualizado_en
    FROM plan
  `;

  const params = [];
  if (soloActivos) {
    sql += ' WHERE activo = 1';
  }

  sql += ' ORDER BY duracion_dias ASC, precio ASC';

  const [filas] = await pool.execute(sql, params);
  return filas;
}

export async function buscarPlanPorId(idPlan) {
  const [filas] = await pool.execute(
    `SELECT id_plan, nombre_plan, descripcion, duracion_dias, precio, ingresos_incluidos, activo, creado_en, actualizado_en
     FROM plan
     WHERE id_plan = ?
     LIMIT 1`,
    [idPlan]
  );

  return filas[0] || null;
}

export async function buscarPlanPorNombre(nombrePlan) {
  const [filas] = await pool.execute(
    `SELECT id_plan, nombre_plan, descripcion, duracion_dias, precio, ingresos_incluidos, activo, creado_en, actualizado_en
     FROM plan
     WHERE nombre_plan = ?
     LIMIT 1`,
    [nombrePlan]
  );

  return filas[0] || null;
}

export async function crearPlan({
  nombre_plan,
  descripcion = null,
  duracion_dias,
  precio,
  ingresos_incluidos = null,
  activo = 1
}) {
  const [resultado] = await pool.execute(
    `INSERT INTO plan (nombre_plan, descripcion, duracion_dias, precio, ingresos_incluidos, activo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre_plan, descripcion, duracion_dias, precio, ingresos_incluidos, activo ? 1 : 0]
  );

  return buscarPlanPorId(resultado.insertId);
}

export async function actualizarPlan(idPlan, campos) {
  const planActual = await buscarPlanPorId(idPlan);
  if (!planActual) {
    return null;
  }

  const nombrePlan = campos.nombre_plan ?? planActual.nombre_plan;
  const descripcion = campos.descripcion !== undefined ? campos.descripcion : planActual.descripcion;
  const duracionDias = campos.duracion_dias ?? planActual.duracion_dias;
  const precio = campos.precio ?? planActual.precio;
  const ingresosIncluidos =
    campos.ingresos_incluidos !== undefined ? campos.ingresos_incluidos : planActual.ingresos_incluidos;
  const activo = campos.activo !== undefined ? (campos.activo ? 1 : 0) : planActual.activo;

  await pool.execute(
    `UPDATE plan
     SET nombre_plan = ?,
         descripcion = ?,
         duracion_dias = ?,
         precio = ?,
         ingresos_incluidos = ?,
         activo = ?
     WHERE id_plan = ?`,
    [nombrePlan, descripcion, duracionDias, precio, ingresosIncluidos, activo, idPlan]
  );

  return buscarPlanPorId(idPlan);
}
