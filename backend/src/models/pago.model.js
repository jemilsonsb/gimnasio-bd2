import { pool } from '../config/database.js';

export async function buscarPagoPorId(idPago) {
  const [filas] = await pool.execute(
    `SELECT 
       p.id_pago,
       p.fk_membresia,
       p.monto,
       p.fecha_pago,
       p.metodo_pago,
       p.estado_pago,
       m.fk_cliente,
       c.codigo_miembro,
       u.id_usuario,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente,
       u.correo AS correo_cliente,
       u.documento_identidad,
       pl.id_plan,
       pl.nombre_plan
     FROM pago p
     INNER JOIN membresia m ON m.id_membresia = p.fk_membresia
     INNER JOIN cliente c ON c.id_cliente = m.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN plan pl ON pl.id_plan = m.fk_plan
     WHERE p.id_pago = ?
     LIMIT 1`,
    [idPago]
  );

  return filas[0] || null;
}

export async function registrarPago({
  fk_membresia,
  monto,
  metodo_pago,
  estado_pago = 'Pagado',
  fecha_pago = null
}) {
  const estadoFinal = estado_pago || 'Pagado';

  let resultado;
  if (fecha_pago) {
    [resultado] = await pool.execute(
      `INSERT INTO pago (fk_membresia, monto, metodo_pago, estado_pago, fecha_pago)
       VALUES (?, ?, ?, ?, ?)`,
      [fk_membresia, monto, metodo_pago, estadoFinal, fecha_pago]
    );
  } else {
    [resultado] = await pool.execute(
      `INSERT INTO pago (fk_membresia, monto, metodo_pago, estado_pago, fecha_pago)
       VALUES (?, ?, ?, ?, NOW())`,
      [fk_membresia, monto, metodo_pago, estadoFinal]
    );
  }

  return buscarPagoPorId(resultado.insertId);
}

export async function listarTodosLosPagos() {
  const [filas] = await pool.execute(
    `SELECT 
       p.id_pago,
       p.fk_membresia,
       p.monto,
       p.fecha_pago,
       p.metodo_pago,
       p.estado_pago,
       m.fk_cliente,
       c.codigo_miembro,
       u.id_usuario,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente,
       u.correo AS correo_cliente,
       u.documento_identidad,
       pl.id_plan,
       pl.nombre_plan
     FROM pago p
     INNER JOIN membresia m ON m.id_membresia = p.fk_membresia
     INNER JOIN cliente c ON c.id_cliente = m.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN plan pl ON pl.id_plan = m.fk_plan
     ORDER BY p.fecha_pago DESC, p.id_pago DESC`
  );

  return filas;
}

export async function listarPagosPorMembresia(idMembresia) {
  const [filas] = await pool.execute(
    `SELECT 
       p.id_pago,
       p.fk_membresia,
       p.monto,
       p.fecha_pago,
       p.metodo_pago,
       p.estado_pago,
       m.fk_cliente,
       pl.nombre_plan
     FROM pago p
     INNER JOIN membresia m ON m.id_membresia = p.fk_membresia
     INNER JOIN plan pl ON pl.id_plan = m.fk_plan
     WHERE p.fk_membresia = ?
     ORDER BY p.fecha_pago DESC, p.id_pago DESC`,
    [idMembresia]
  );

  return filas;
}
