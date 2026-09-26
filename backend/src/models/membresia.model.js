import { pool } from '../config/database.js';

export async function buscarClientePorId(idCliente) {
  const [filas] = await pool.execute(
    `SELECT c.id_cliente, c.codigo_miembro, c.fk_usuario,
            u.id_usuario, u.nombre, u.apellido, u.correo, u.documento_identidad,
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

export async function buscarClientePorUsuario(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT c.id_cliente, c.codigo_miembro, c.fk_usuario,
            u.id_usuario, u.nombre, u.apellido, u.correo, u.documento_identidad,
            e.nombre_estado AS estado
     FROM cliente c
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN estado e ON e.id_estado = u.fk_estado
     WHERE c.fk_usuario = ?
     LIMIT 1`,
    [idUsuario]
  );

  return filas[0] || null;
}

export async function buscarMembresiaPorId(idMembresia) {
  const [filas] = await pool.execute(
    `SELECT 
       m.id_membresia,
       m.fk_cliente,
       c.codigo_miembro,
       u.id_usuario,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
       u.correo AS correo_usuario,
       u.documento_identidad,
       m.fk_plan,
       p.nombre_plan,
       p.duracion_dias,
       m.fecha_inicio,
       m.fecha_vencimiento,
       m.precio_pagado,
       m.estado_membresia,
       m.creado_en,
       m.actualizado_en,
       CASE 
         WHEN m.estado_membresia = 'Cancelada' THEN 'Cancelada'
         WHEN CURDATE() < m.fecha_inicio THEN 'Pendiente'
         WHEN CURDATE() BETWEEN m.fecha_inicio AND m.fecha_vencimiento THEN 'Activa'
         ELSE 'Vencida'
       END AS vigencia,
       DATEDIFF(m.fecha_vencimiento, CURDATE()) AS dias_restantes
     FROM membresia m
     INNER JOIN cliente c ON c.id_cliente = m.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN plan p ON p.id_plan = m.fk_plan
     WHERE m.id_membresia = ?
     LIMIT 1`,
    [idMembresia]
  );

  return filas[0] || null;
}

export async function registrarMembresia({ fk_cliente, fk_plan, fecha_inicio }) {
  // 1. Validar existencia y estado del cliente
  const cliente = await buscarClientePorId(fk_cliente);

  if (!cliente) {
    const error = new Error('El cliente especificado no existe');
    error.code = 'CLIENT_NOT_FOUND';
    throw error;
  }

  if (cliente.estado !== 'Activo') {
    const error = new Error('El cliente está inactivo y no se le puede asignar una membresía');
    error.code = 'INACTIVE_USER';
    throw error;
  }

  // 2. Validar existencia y vigencia del plan
  const [planes] = await pool.execute(
    `SELECT id_plan, nombre_plan, duracion_dias, precio, activo
     FROM plan
     WHERE id_plan = ?
     LIMIT 1`,
    [fk_plan]
  );

  if (planes.length === 0) {
    const error = new Error('El plan especificado no existe');
    error.code = 'PLAN_NOT_FOUND';
    throw error;
  }

  const plan = planes[0];
  if (!plan.activo) {
    const error = new Error('El plan seleccionado se encuentra desactivado');
    error.code = 'PLAN_INACTIVE';
    throw error;
  }

  // 3. Determinar fecha de inicio (si no se envía, se usa la fecha actual)
  const fechaInicioValida = fecha_inicio && String(fecha_inicio).trim() !== ''
    ? String(fecha_inicio).trim()
    : null;

  // 4. Insertar membresía calculando fecha_vencimiento y congelando precio_pagado
  let resultado;
  if (fechaInicioValida) {
    [resultado] = await pool.execute(
      `INSERT INTO membresia 
        (fk_cliente, fk_plan, fecha_inicio, fecha_vencimiento, precio_pagado, estado_membresia)
       VALUES (?, ?, ?, DATE_ADD(?, INTERVAL ? DAY), ?, 'Activa')`,
      [fk_cliente, fk_plan, fechaInicioValida, fechaInicioValida, plan.duracion_dias, plan.precio]
    );
  } else {
    [resultado] = await pool.execute(
      `INSERT INTO membresia 
        (fk_cliente, fk_plan, fecha_inicio, fecha_vencimiento, precio_pagado, estado_membresia)
       VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, 'Activa')`,
      [fk_cliente, fk_plan, plan.duracion_dias, plan.precio]
    );
  }

  return buscarMembresiaPorId(resultado.insertId);
}

export async function listarMembresiasPorCliente(idCliente) {
  const cliente = await buscarClientePorId(idCliente);
  if (!cliente) {
    return null;
  }

  const [membresias] = await pool.execute(
    `SELECT 
       m.id_membresia,
       m.fk_cliente,
       c.codigo_miembro,
       u.id_usuario,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
       u.correo AS correo_usuario,
       m.fk_plan,
       p.nombre_plan,
       p.duracion_dias,
       m.fecha_inicio,
       m.fecha_vencimiento,
       m.precio_pagado,
       m.estado_membresia,
       m.creado_en,
       m.actualizado_en,
       CASE 
         WHEN m.estado_membresia = 'Cancelada' THEN 'Cancelada'
         WHEN CURDATE() < m.fecha_inicio THEN 'Pendiente'
         WHEN CURDATE() BETWEEN m.fecha_inicio AND m.fecha_vencimiento THEN 'Activa'
         ELSE 'Vencida'
       END AS vigencia,
       DATEDIFF(m.fecha_vencimiento, CURDATE()) AS dias_restantes
     FROM membresia m
     INNER JOIN cliente c ON c.id_cliente = m.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN plan p ON p.id_plan = m.fk_plan
     WHERE m.fk_cliente = ?
     ORDER BY m.fecha_inicio DESC, m.id_membresia DESC`,
    [idCliente]
  );

  return {
    cliente,
    historial: membresias
  };
}

export async function listarMembresiasPorUsuario(idUsuario) {
  // 1. Verificar si el usuario existe en el sistema
  const [usuarios] = await pool.execute(
    'SELECT id_usuario, nombre, apellido, correo FROM usuario WHERE id_usuario = ? LIMIT 1',
    [idUsuario]
  );

  if (usuarios.length === 0) {
    const error = new Error('Usuario no encontrado');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // 2. Traducir id_usuario a su registro en cliente
  const cliente = await buscarClientePorUsuario(idUsuario);
  if (!cliente) {
    const error = new Error('El usuario no tiene un perfil de cliente asociado');
    error.code = 'CLIENT_PROFILE_NOT_FOUND';
    throw error;
  }

  // 3. Consultar membresías por fk_cliente
  return listarMembresiasPorCliente(cliente.id_cliente);
}

export async function listarTodasMembresias({ limit = 100, offset = 0 } = {}) {
  const [filas] = await pool.execute(
    `SELECT 
       m.id_membresia,
       m.fk_cliente,
       c.codigo_miembro,
       u.id_usuario,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario,
       u.correo AS correo_usuario,
       u.documento_identidad,
       m.fk_plan,
       p.nombre_plan,
       p.duracion_dias,
       m.fecha_inicio,
       m.fecha_vencimiento,
       m.precio_pagado,
       m.estado_membresia,
       m.creado_en,
       CASE 
         WHEN m.estado_membresia = 'Cancelada' THEN 'Cancelada'
         WHEN CURDATE() < m.fecha_inicio THEN 'Pendiente'
         WHEN CURDATE() BETWEEN m.fecha_inicio AND m.fecha_vencimiento THEN 'Activa'
         ELSE 'Vencida'
       END AS vigencia,
       DATEDIFF(m.fecha_vencimiento, CURDATE()) AS dias_restantes
     FROM membresia m
     INNER JOIN cliente c ON c.id_cliente = m.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN plan p ON p.id_plan = m.fk_plan
     ORDER BY m.creado_en DESC
     LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
  );

  return filas;
}

export async function cancelarMembresia(idMembresia) {
  const [resultado] = await pool.execute(
    `UPDATE membresia 
     SET estado_membresia = 'Cancelada'
     WHERE id_membresia = ?`,
    [idMembresia]
  );

  if (resultado.affectedRows === 0) {
    return null;
  }

  return buscarMembresiaPorId(idMembresia);
}
