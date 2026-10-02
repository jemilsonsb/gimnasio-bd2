import { pool } from '../config/database.js';
import { buscarClientePorId } from './membresia.model.js';
import { evaluarIngreso, seleccionarMembresiaVigente } from '../utils/asistencia-reglas.js';

function primerDiaMes(mes) {
  return `${mes}-01`;
}

function ultimoDiaMes(mes) {
  const [anio, mesNumero] = mes.split('-').map(Number);
  const ultimoDia = new Date(anio, mesNumero, 0).getDate();
  return `${mes}-${String(ultimoDia).padStart(2, '0')}`;
}

export async function registrarIngreso({ fk_cliente, fk_usuario_registro }) {
  const cliente = await buscarClientePorId(fk_cliente);
  if (!cliente) {
    const error = new Error('El cliente especificado no existe');
    error.code = 'CLIENT_NOT_FOUND';
    throw error;
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [filasHoy] = await conexion.execute('SELECT CURDATE() AS hoy');
    const hoy = filasHoy[0].hoy;

    const [membresias] = await conexion.execute(
      `SELECT id_membresia, estado_membresia, fecha_inicio, fecha_vencimiento, ingresos_incluidos
       FROM membresia
       WHERE fk_cliente = ?
       FOR UPDATE`,
      [fk_cliente]
    );

    const vigente = seleccionarMembresiaVigente(membresias, hoy);
    if (!vigente) {
      await conexion.rollback();
      const error = new Error('El cliente no tiene una membresía vigente');
      error.code = 'MEMBERSHIP_REQUIRED';
      throw error;
    }

    const [[{ total }]] = await conexion.execute(
      'SELECT COUNT(*) AS total FROM asistencia WHERE fk_membresia = ?',
      [vigente.id_membresia]
    );
    const [[{ hoyCantidad }]] = await conexion.execute(
      'SELECT COUNT(*) AS hoyCantidad FROM asistencia WHERE fk_membresia = ? AND fecha = ?',
      [vigente.id_membresia, hoy]
    );

    const resultado = evaluarIngreso({
      ingresosIncluidos: vigente.ingresos_incluidos,
      ingresosRegistrados: Number(total),
      yaIngresoHoy: Number(hoyCantidad) > 0
    });

    if (resultado.codigo === 'NO_ENTRIES_LEFT') {
      await conexion.rollback();
      const error = new Error('El cliente no tiene ingresos disponibles en su tiquetera');
      error.code = 'NO_ENTRIES_LEFT';
      throw error;
    }

    if (resultado.codigo === 'ALREADY_CHECKED_IN') {
      await conexion.rollback();
      const error = new Error('El cliente ya registró su ingreso hoy');
      error.code = 'ALREADY_CHECKED_IN';
      throw error;
    }

    await conexion.execute(
      `INSERT INTO asistencia (fk_membresia, fecha, fk_usuario_registro)
       VALUES (?, ?, ?)`,
      [vigente.id_membresia, hoy, fk_usuario_registro]
    );

    await conexion.commit();

    return {
      id_membresia: vigente.id_membresia,
      fecha: hoy,
      ingresos_incluidos: vigente.ingresos_incluidos,
      ingresos_restantes: resultado.ingresosRestantes
    };
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

export async function obtenerResumenAsistencias({ fk_cliente, mes }) {
  const [filasHoy] = await pool.execute('SELECT CURDATE() AS hoy');
  const hoy = filasHoy[0].hoy;
  const mesFinal = mes || hoy.slice(0, 7);

  const [membresias] = await pool.execute(
    `SELECT id_membresia, estado_membresia, fecha_inicio, fecha_vencimiento, ingresos_incluidos
     FROM membresia
     WHERE fk_cliente = ?`,
    [fk_cliente]
  );

  const vigente = seleccionarMembresiaVigente(membresias, hoy);

  let membresiaVigente = null;
  if (vigente) {
    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM asistencia WHERE fk_membresia = ?',
      [vigente.id_membresia]
    );
    const ingresosUsados = Number(total);
    membresiaVigente = {
      id_membresia: vigente.id_membresia,
      ingresos_incluidos: vigente.ingresos_incluidos,
      ingresos_usados: ingresosUsados,
      ingresos_restantes:
        vigente.ingresos_incluidos === null ? null : vigente.ingresos_incluidos - ingresosUsados
    };
  }

  const [diasFilas] = await pool.execute(
    `SELECT DISTINCT a.fecha
     FROM asistencia a
     INNER JOIN membresia m ON m.id_membresia = a.fk_membresia
     WHERE m.fk_cliente = ? AND a.fecha BETWEEN ? AND ?
     ORDER BY a.fecha ASC`,
    [fk_cliente, primerDiaMes(mesFinal), ultimoDiaMes(mesFinal)]
  );

  return {
    mes: mesFinal,
    dias_asistidos: diasFilas.map((fila) => fila.fecha),
    membresia_vigente: membresiaVigente
  };
}
