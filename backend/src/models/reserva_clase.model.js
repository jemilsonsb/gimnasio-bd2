import { pool } from '../config/database.js';

const SELECT_RESERVA = `
  SELECT
    r.id_reserva,
    r.fecha_reserva,
    r.estado_reserva,
    r.fk_programacion,
    pc.fecha AS fecha_clase,
    pc.hora_inicio,
    pc.hora_fin,
    pc.cupos_disponibles,
    pc.fk_clase,
    cl.nombre_clase,
    r.fk_cliente,
    c.fk_usuario AS id_usuario_cliente,
    CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente,
    u.correo AS correo_cliente
  FROM reserva_clase r
  INNER JOIN programacion_clase pc ON pc.id_programacion = r.fk_programacion
  INNER JOIN clase cl ON cl.id_clase = pc.fk_clase
  INNER JOIN cliente c ON c.id_cliente = r.fk_cliente
  INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
`;

export async function buscarReservaPorId(idReserva) {
  const [filas] = await pool.execute(
    `${SELECT_RESERVA}
     WHERE r.id_reserva = ?
     LIMIT 1`,
    [idReserva]
  );
  return filas[0] || null;
}

export async function listarReservasPorProgramacion(idProgramacion) {
  const [filas] = await pool.execute(
    `${SELECT_RESERVA}
     WHERE r.fk_programacion = ?
     ORDER BY r.fecha_reserva DESC`,
    [idProgramacion]
  );
  return filas;
}

export async function listarReservasPorCliente(idCliente) {
  const [filas] = await pool.execute(
    `${SELECT_RESERVA}
     WHERE r.fk_cliente = ?
     ORDER BY pc.fecha DESC, pc.hora_inicio ASC`,
    [idCliente]
  );
  return filas;
}

/**
 * Crea una reserva de forma atómica:
 *  1. Bloquea la fila de programación con SELECT ... FOR UPDATE
 *  2. Verifica que la programación no sea pasada
 *  3. Verifica que el cliente no tenga ya una reserva 'Confirmada' para esa programación
 *  4. Hace UPDATE condicional de cupos (WHERE cupos_disponibles > 0)
 *  5. Si affectedRows === 0 → rollback → NO_CUPOS_DISPONIBLES
 *  6. Inserta la reserva y hace commit
 */
export async function crearReservaSegura({ fk_programacion, fk_cliente }) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    // 1. Bloquear fila de programación
    const [filasProg] = await conexion.execute(
      `SELECT id_programacion, fecha, hora_inicio, cupos_disponibles
       FROM programacion_clase
       WHERE id_programacion = ?
       LIMIT 1
       FOR UPDATE`,
      [fk_programacion]
    );

    if (filasProg.length === 0) {
      await conexion.rollback();
      const error = new Error('La programación no existe');
      error.code = 'PROGRAMACION_NOT_FOUND';
      throw error;
    }

    const prog = filasProg[0];

    // 2. Verificar que la programación no sea pasada
    const [filasHoy] = await conexion.execute('SELECT CURDATE() AS hoy');
    const hoy = filasHoy[0].hoy; // YYYY-MM-DD string (dateStrings: true)
    if (prog.fecha < hoy) {
      await conexion.rollback();
      const error = new Error('No se pueden reservar clases de fechas pasadas');
      error.code = 'PROGRAMACION_PASADA';
      throw error;
    }

    // 3. Verificar reserva duplicada para este cliente en esta programación
    const [filasExiste] = await conexion.execute(
      `SELECT id_reserva FROM reserva_clase
       WHERE fk_programacion = ? AND fk_cliente = ? AND estado_reserva = 'Confirmada'
       LIMIT 1`,
      [fk_programacion, fk_cliente]
    );

    if (filasExiste.length > 0) {
      await conexion.rollback();
      const error = new Error('Ya tienes una reserva confirmada para esta clase');
      error.code = 'ALREADY_RESERVED';
      throw error;
    }

    // 4. Descontar cupo condicionalmente
    const [updateResult] = await conexion.execute(
      `UPDATE programacion_clase
       SET cupos_disponibles = cupos_disponibles - 1
       WHERE id_programacion = ? AND cupos_disponibles > 0`,
      [fk_programacion]
    );

    if (updateResult.affectedRows === 0) {
      await conexion.rollback();
      const error = new Error('No hay cupos disponibles para esta clase');
      error.code = 'NO_CUPOS_DISPONIBLES';
      throw error;
    }

    // 5. Insertar reserva
    const [insertResult] = await conexion.execute(
      `INSERT INTO reserva_clase (fk_programacion, fk_cliente, fecha_reserva, estado_reserva)
       VALUES (?, ?, NOW(), 'Confirmada')`,
      [fk_programacion, fk_cliente]
    );

    await conexion.commit();
    return buscarReservaPorId(insertResult.insertId);
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

/**
 * Cancela una reserva de forma atómica:
 *  - Solo el dueño puede cancelar (validado en el controlador, 403 si no coincide)
 *  - Rechaza estados 'Cancelada' y 'Asistio'
 *  - Devuelve el cupo a la programación
 */
export async function cancelarReservaSegura(idReserva) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    // Bloquear reserva
    const [filasReserva] = await conexion.execute(
      `SELECT id_reserva, estado_reserva, fk_programacion
       FROM reserva_clase
       WHERE id_reserva = ?
       LIMIT 1
       FOR UPDATE`,
      [idReserva]
    );

    if (filasReserva.length === 0) {
      await conexion.rollback();
      return null; // 404 en el controlador
    }

    const reserva = filasReserva[0];

    if (reserva.estado_reserva === 'Cancelada') {
      await conexion.rollback();
      const error = new Error('La reserva ya está cancelada');
      error.code = 'ALREADY_CANCELLED';
      throw error;
    }

    if (reserva.estado_reserva === 'Asistio') {
      await conexion.rollback();
      const error = new Error('No se puede cancelar una reserva con asistencia registrada');
      error.code = 'RESERVA_ASISTIDA';
      throw error;
    }

    // Cancelar reserva
    await conexion.execute(
      `UPDATE reserva_clase SET estado_reserva = 'Cancelada' WHERE id_reserva = ?`,
      [idReserva]
    );

    // Devolver cupo
    await conexion.execute(
      `UPDATE programacion_clase
       SET cupos_disponibles = cupos_disponibles + 1
       WHERE id_programacion = ?`,
      [reserva.fk_programacion]
    );

    await conexion.commit();
    return buscarReservaPorId(idReserva);
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

/**
 * Marca la asistencia de una reserva de forma atómica:
 *  - Solo reservas 'Confirmada' de clases de hoy o anteriores (CURDATE() de la BD)
 *  - Un Entrenador solo puede marcar reservas de sus propias programaciones (idEntrenador)
 *  - No devuelve el cupo (a diferencia de cancelarReservaSegura)
 */
export async function marcarAsistioSegura(idReserva, { idEntrenador = null } = {}) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    // Bloquear reserva y traer datos de su programación
    const [filasReserva] = await conexion.execute(
      `SELECT r.id_reserva, r.estado_reserva, r.fk_programacion, pc.fecha, pc.fk_entrenador
       FROM reserva_clase r
       INNER JOIN programacion_clase pc ON pc.id_programacion = r.fk_programacion
       WHERE r.id_reserva = ?
       LIMIT 1
       FOR UPDATE`,
      [idReserva]
    );

    if (filasReserva.length === 0) {
      await conexion.rollback();
      return null; // 404 en el controlador
    }

    const reserva = filasReserva[0];

    if (reserva.estado_reserva === 'Cancelada') {
      await conexion.rollback();
      const error = new Error('La reserva está cancelada');
      error.code = 'RESERVA_CANCELADA';
      throw error;
    }

    if (reserva.estado_reserva === 'Asistio') {
      await conexion.rollback();
      const error = new Error('La asistencia ya fue registrada');
      error.code = 'RESERVA_YA_ASISTIO';
      throw error;
    }

    const [filasHoy] = await conexion.execute('SELECT CURDATE() AS hoy');
    const hoy = filasHoy[0].hoy;
    if (reserva.fecha > hoy) {
      await conexion.rollback();
      const error = new Error('No se puede marcar asistencia de una clase futura');
      error.code = 'CLASE_FUTURA';
      throw error;
    }

    if (idEntrenador !== null && reserva.fk_entrenador !== idEntrenador) {
      await conexion.rollback();
      const error = new Error('No puedes marcar asistencia de una clase que no es tuya');
      error.code = 'FORBIDDEN_CLASE_AJENA';
      throw error;
    }

    await conexion.execute(
      `UPDATE reserva_clase SET estado_reserva = 'Asistio' WHERE id_reserva = ?`,
      [idReserva]
    );

    await conexion.commit();
    return buscarReservaPorId(idReserva);
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}
