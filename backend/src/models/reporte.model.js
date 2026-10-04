import { pool } from '../config/database.js';

export async function obtenerReporteIngresos({
  fechaInicio,
  fechaFin,
  fkCliente,
  fkPlan,
  metodoPago,
  estadoPago
} = {}) {
  const condicionesBase = [];
  const parametrosBase = [];

  if (fechaInicio) {
    condicionesBase.push('p.fecha_pago >= ?');
    parametrosBase.push(`${fechaInicio} 00:00:00`);
  }
  if (fechaFin) {
    condicionesBase.push('p.fecha_pago <= ?');
    parametrosBase.push(`${fechaFin} 23:59:59`);
  }
  if (fkCliente) {
    condicionesBase.push('m.fk_cliente = ?');
    parametrosBase.push(fkCliente);
  }
  if (fkPlan) {
    condicionesBase.push('m.fk_plan = ?');
    parametrosBase.push(fkPlan);
  }

  const whereBase = condicionesBase.length ? `WHERE ${condicionesBase.join(' AND ')}` : '';
  const prefijoEstado = condicionesBase.length ? 'AND' : 'WHERE';

  async function totalPorEstado(estado) {
    const [filas] = await pool.execute(
      `SELECT COALESCE(SUM(p.monto), 0) AS total
       FROM pago p
       INNER JOIN membresia m ON m.id_membresia = p.fk_membresia
       ${whereBase} ${prefijoEstado} p.estado_pago = ?`,
      [...parametrosBase, estado]
    );
    return Number(filas[0].total);
  }

  const [totalPagado, totalPendiente, totalRechazado] = await Promise.all([
    totalPorEstado('Pagado'),
    totalPorEstado('Pendiente'),
    totalPorEstado('Rechazado')
  ]);

  const [porMetodoPago] = await pool.execute(
    `SELECT p.metodo_pago, COALESCE(SUM(p.monto), 0) AS total, COUNT(*) AS cantidad
     FROM pago p
     INNER JOIN membresia m ON m.id_membresia = p.fk_membresia
     ${whereBase} ${prefijoEstado} p.estado_pago = 'Pagado'
     GROUP BY p.metodo_pago`,
    parametrosBase
  );

  const [porPlan] = await pool.execute(
    `SELECT pl.id_plan, pl.nombre_plan, COALESCE(SUM(p.monto), 0) AS total, COUNT(*) AS cantidad
     FROM pago p
     INNER JOIN membresia m ON m.id_membresia = p.fk_membresia
     INNER JOIN plan pl ON pl.id_plan = m.fk_plan
     ${whereBase} ${prefijoEstado} p.estado_pago = 'Pagado'
     GROUP BY pl.id_plan, pl.nombre_plan`,
    parametrosBase
  );

  const condicionesDetalle = [...condicionesBase];
  const parametrosDetalle = [...parametrosBase];
  if (metodoPago) {
    condicionesDetalle.push('p.metodo_pago = ?');
    parametrosDetalle.push(metodoPago);
  }
  if (estadoPago) {
    condicionesDetalle.push('p.estado_pago = ?');
    parametrosDetalle.push(estadoPago);
  }
  const whereDetalle = condicionesDetalle.length ? `WHERE ${condicionesDetalle.join(' AND ')}` : '';

  const [detalle] = await pool.execute(
    `SELECT
       p.id_pago, p.fk_membresia, p.monto, p.fecha_pago, p.metodo_pago, p.estado_pago,
       m.fk_cliente, c.codigo_miembro,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente, u.correo AS correo_cliente,
       pl.id_plan, pl.nombre_plan
     FROM pago p
     INNER JOIN membresia m ON m.id_membresia = p.fk_membresia
     INNER JOIN cliente c ON c.id_cliente = m.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN plan pl ON pl.id_plan = m.fk_plan
     ${whereDetalle}
     ORDER BY p.fecha_pago DESC`,
    parametrosDetalle
  );

  return {
    resumen: {
      total_pagado: totalPagado,
      total_pendiente: totalPendiente,
      total_rechazado: totalRechazado,
      por_metodo_pago: porMetodoPago,
      por_plan: porPlan
    },
    detalle
  };
}

export async function obtenerReporteMembresias({
  fechaInicio,
  fechaFin,
  fkCliente,
  fkPlan,
  estadoMembresia
} = {}) {
  const condicionesConteo = [];
  const parametrosConteo = [];
  if (fkCliente) {
    condicionesConteo.push('m.fk_cliente = ?');
    parametrosConteo.push(fkCliente);
  }
  if (fkPlan) {
    condicionesConteo.push('m.fk_plan = ?');
    parametrosConteo.push(fkPlan);
  }
  const whereConteo = condicionesConteo.length ? `WHERE ${condicionesConteo.join(' AND ')}` : '';
  const prefijoConteo = condicionesConteo.length ? 'AND' : 'WHERE';

  async function contarPorEstado(estado) {
    const [filas] = await pool.execute(
      `SELECT COUNT(*) AS total FROM membresia m
       ${whereConteo} ${prefijoConteo} m.estado_membresia = ?`,
      [...parametrosConteo, estado]
    );
    return Number(filas[0].total);
  }

  const [activas, vencidas, canceladas, porVencerFilas] = await Promise.all([
    contarPorEstado('Activa'),
    contarPorEstado('Vencida'),
    contarPorEstado('Cancelada'),
    pool.execute(
      `SELECT COUNT(*) AS total FROM membresia m
       ${whereConteo} ${prefijoConteo} m.estado_membresia = 'Activa'
         AND m.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
      parametrosConteo
    )
  ]);

  const condicionesDetalle = [...condicionesConteo];
  const parametrosDetalle = [...parametrosConteo];
  if (estadoMembresia) {
    condicionesDetalle.push('m.estado_membresia = ?');
    parametrosDetalle.push(estadoMembresia);
  }
  if (fechaInicio) {
    condicionesDetalle.push('m.fecha_inicio >= ?');
    parametrosDetalle.push(fechaInicio);
  }
  if (fechaFin) {
    condicionesDetalle.push('m.fecha_inicio <= ?');
    parametrosDetalle.push(fechaFin);
  }
  const whereDetalle = condicionesDetalle.length ? `WHERE ${condicionesDetalle.join(' AND ')}` : '';

  const [detalle] = await pool.execute(
    `SELECT
       m.id_membresia, m.fk_cliente, c.codigo_miembro,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente, u.correo AS correo_cliente,
       m.fk_plan, p.nombre_plan, m.fecha_inicio, m.fecha_vencimiento, m.precio_pagado, m.estado_membresia
     FROM membresia m
     INNER JOIN cliente c ON c.id_cliente = m.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN plan p ON p.id_plan = m.fk_plan
     ${whereDetalle}
     ORDER BY m.fecha_vencimiento ASC`,
    parametrosDetalle
  );

  return {
    resumen: {
      activas,
      vencidas,
      canceladas,
      por_vencer: Number(porVencerFilas[0][0].total)
    },
    detalle
  };
}

export async function obtenerReporteClases({
  fechaInicio,
  fechaFin,
  fkClase,
  fkEntrenador,
  fkProgramacion,
  fkCliente
} = {}) {
  const condiciones = [];
  const parametros = [];
  if (fechaInicio) {
    condiciones.push('pc.fecha >= ?');
    parametros.push(fechaInicio);
  }
  if (fechaFin) {
    condiciones.push('pc.fecha <= ?');
    parametros.push(fechaFin);
  }
  if (fkClase) {
    condiciones.push('pc.fk_clase = ?');
    parametros.push(fkClase);
  }
  if (fkEntrenador) {
    condiciones.push('pc.fk_entrenador = ?');
    parametros.push(fkEntrenador);
  }
  if (fkProgramacion) {
    condiciones.push('pc.id_programacion = ?');
    parametros.push(fkProgramacion);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [ocupacion] = await pool.execute(
    `SELECT
       pc.id_programacion, pc.fecha, pc.hora_inicio, pc.hora_fin,
       cl.id_clase, cl.nombre_clase, cl.capacidad_maxima, pc.cupos_disponibles,
       (cl.capacidad_maxima - pc.cupos_disponibles) AS cupos_usados
     FROM programacion_clase pc
     INNER JOIN clase cl ON cl.id_clase = pc.fk_clase
     ${where}
     ORDER BY pc.fecha DESC, pc.hora_inicio ASC`,
    parametros
  );

  const [reservasPorEstado] = await pool.execute(
    `SELECT r.estado_reserva, COUNT(*) AS cantidad
     FROM reserva_clase r
     INNER JOIN programacion_clase pc ON pc.id_programacion = r.fk_programacion
     ${where}
     GROUP BY r.estado_reserva`,
    parametros
  );

  const condicionesDetalle = [...condiciones];
  const parametrosDetalle = [...parametros];
  if (fkCliente) {
    condicionesDetalle.push('r.fk_cliente = ?');
    parametrosDetalle.push(fkCliente);
  }
  const whereDetalle = condicionesDetalle.length ? `WHERE ${condicionesDetalle.join(' AND ')}` : '';

  const [detalle] = await pool.execute(
    `SELECT
       r.id_reserva, r.estado_reserva, r.fecha_reserva,
       pc.id_programacion, pc.fecha AS fecha_clase, pc.hora_inicio, pc.hora_fin,
       cl.nombre_clase,
       r.fk_cliente, c.codigo_miembro,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente, u.correo AS correo_cliente
     FROM reserva_clase r
     INNER JOIN programacion_clase pc ON pc.id_programacion = r.fk_programacion
     INNER JOIN clase cl ON cl.id_clase = pc.fk_clase
     INNER JOIN cliente c ON c.id_cliente = r.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     ${whereDetalle}
     ORDER BY pc.fecha DESC, pc.hora_inicio ASC`,
    parametrosDetalle
  );

  return {
    resumen: {
      ocupacion,
      reservas_por_estado: reservasPorEstado
    },
    detalle
  };
}

export async function obtenerReporteClientes({ fechaInicio, fechaFin, estado } = {}) {
  const [[{ total_activos }]] = await pool.execute(
    `SELECT COUNT(*) AS total_activos
     FROM cliente c
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN estado e ON e.id_estado = u.fk_estado
     INNER JOIN rol r ON r.id_rol = u.fk_rol
     WHERE e.nombre_estado = 'Activo' AND r.nombre_rol = 'Cliente'`
  );

  const condicionesNuevos = ["r.nombre_rol = 'Cliente'"];
  const parametrosNuevos = [];
  if (fechaInicio) {
    condicionesNuevos.push('u.fecha_registro >= ?');
    parametrosNuevos.push(`${fechaInicio} 00:00:00`);
  }
  if (fechaFin) {
    condicionesNuevos.push('u.fecha_registro <= ?');
    parametrosNuevos.push(`${fechaFin} 23:59:59`);
  }
  const whereNuevos = condicionesNuevos.length ? `WHERE ${condicionesNuevos.join(' AND ')}` : '';

  const [[{ nuevos_periodo }]] = await pool.execute(
    `SELECT COUNT(*) AS nuevos_periodo
     FROM cliente c
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN rol r ON r.id_rol = u.fk_rol
     ${whereNuevos}`,
    parametrosNuevos
  );

  const condicionesDetalle = ["r.nombre_rol = 'Cliente'"];
  const parametrosDetalle = [];
  if (estado) {
    condicionesDetalle.push('e.nombre_estado = ?');
    parametrosDetalle.push(estado);
  }
  if (fechaInicio) {
    condicionesDetalle.push('u.fecha_registro >= ?');
    parametrosDetalle.push(`${fechaInicio} 00:00:00`);
  }
  if (fechaFin) {
    condicionesDetalle.push('u.fecha_registro <= ?');
    parametrosDetalle.push(`${fechaFin} 23:59:59`);
  }
  const whereDetalle = condicionesDetalle.length ? `WHERE ${condicionesDetalle.join(' AND ')}` : '';

  const [detalle] = await pool.execute(
    `SELECT
       c.id_cliente, c.codigo_miembro, u.id_usuario,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente, u.correo, u.telefono,
       u.fecha_registro, e.nombre_estado AS estado
     FROM cliente c
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN estado e ON e.id_estado = u.fk_estado
     INNER JOIN rol r ON r.id_rol = u.fk_rol
     ${whereDetalle}
     ORDER BY u.fecha_registro DESC`,
    parametrosDetalle
  );

  return {
    resumen: {
      total_activos: Number(total_activos),
      nuevos_periodo: Number(nuevos_periodo)
    },
    detalle
  };
}

export async function obtenerReporteAsistencias({ fechaInicio, fechaFin, fkCliente, fkPlan } = {}) {
  const condiciones = [];
  const parametros = [];
  if (fechaInicio) {
    condiciones.push('a.fecha >= ?');
    parametros.push(fechaInicio);
  }
  if (fechaFin) {
    condiciones.push('a.fecha <= ?');
    parametros.push(fechaFin);
  }
  if (fkCliente) {
    condiciones.push('m.fk_cliente = ?');
    parametros.push(fkCliente);
  }
  if (fkPlan) {
    condiciones.push('m.fk_plan = ?');
    parametros.push(fkPlan);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [[{ total_ingresos }]] = await pool.execute(
    `SELECT COUNT(*) AS total_ingresos
     FROM asistencia a
     INNER JOIN membresia m ON m.id_membresia = a.fk_membresia
     ${where}`,
    parametros
  );

  const [porPlan] = await pool.execute(
    `SELECT pl.id_plan, pl.nombre_plan, COUNT(*) AS cantidad
     FROM asistencia a
     INNER JOIN membresia m ON m.id_membresia = a.fk_membresia
     INNER JOIN plan pl ON pl.id_plan = m.fk_plan
     ${where}
     GROUP BY pl.id_plan, pl.nombre_plan`,
    parametros
  );

  const [detalle] = await pool.execute(
    `SELECT
       a.id_asistencia, a.fecha, a.fecha_hora,
       m.id_membresia, m.fk_cliente, c.codigo_miembro,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente, u.correo AS correo_cliente,
       pl.id_plan, pl.nombre_plan
     FROM asistencia a
     INNER JOIN membresia m ON m.id_membresia = a.fk_membresia
     INNER JOIN cliente c ON c.id_cliente = m.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN plan pl ON pl.id_plan = m.fk_plan
     ${where}
     ORDER BY a.fecha DESC, a.fecha_hora DESC`,
    parametros
  );

  return {
    resumen: {
      total_ingresos: Number(total_ingresos),
      por_plan: porPlan
    },
    detalle
  };
}

export async function obtenerReporteRutinas({
  fkEntrenador,
  fkCliente,
  estado,
  fechaInicio,
  fechaFin
} = {}) {
  const condiciones = [];
  const parametros = [];
  if (fkEntrenador) {
    condiciones.push('r.fk_entrenador = ?');
    parametros.push(fkEntrenador);
  }
  if (fkCliente) {
    condiciones.push('r.fk_cliente = ?');
    parametros.push(fkCliente);
  }
  if (estado) {
    condiciones.push('r.estado = ?');
    parametros.push(estado);
  }
  if (fechaInicio) {
    condiciones.push('r.fecha_inicio >= ?');
    parametros.push(fechaInicio);
  }
  if (fechaFin) {
    condiciones.push('r.fecha_inicio <= ?');
    parametros.push(fechaFin);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [porEstado] = await pool.execute(
    `SELECT r.estado, COUNT(*) AS cantidad
     FROM rutina r
     ${where}
     GROUP BY r.estado`,
    parametros
  );

  const [detalle] = await pool.execute(
    `SELECT
       r.id_rutina, r.nombre_rutina, r.objetivo, r.fecha_inicio, r.fecha_fin, r.estado,
       r.fk_cliente, CONCAT(uc.nombre, ' ', uc.apellido) AS nombre_cliente,
       r.fk_entrenador, CONCAT(ue.nombre, ' ', ue.apellido) AS nombre_entrenador
     FROM rutina r
     INNER JOIN cliente c ON c.id_cliente = r.fk_cliente
     INNER JOIN usuario uc ON uc.id_usuario = c.fk_usuario
     INNER JOIN entrenador e ON e.id_entrenador = r.fk_entrenador
     INNER JOIN usuario ue ON ue.id_usuario = e.fk_usuario
     ${where}
     ORDER BY r.fecha_inicio DESC`,
    parametros
  );

  return {
    resumen: { por_estado: porEstado },
    detalle
  };
}
