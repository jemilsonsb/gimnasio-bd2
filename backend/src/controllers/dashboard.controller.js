import { buscarEntrenadorPorUsuario } from '../models/entrenador.model.js';
import { listarMembresiasPorUsuario } from '../models/membresia.model.js';
import { listarProgramacionesFuturas } from '../models/programacion_clase.model.js';
import { listarReservasPorCliente } from '../models/reserva_clase.model.js';
import {
  obtenerReporteClases,
  obtenerReporteClientes,
  obtenerReporteIngresos,
  obtenerReporteMembresias,
  obtenerReporteRutinas
} from '../models/reporte.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

function formatoFecha(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function fechasReferencia() {
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const en7Dias = new Date(hoy);
  en7Dias.setDate(en7Dias.getDate() + 7);

  return {
    hoy: formatoFecha(hoy),
    primerDiaMes: formatoFecha(primerDiaMes),
    en7Dias: formatoFecha(en7Dias)
  };
}

async function construirDashboardAdministrador() {
  const { hoy, primerDiaMes, en7Dias } = fechasReferencia();

  const [
    reporteClientes,
    reporteMembresiasActivas,
    reporteIngresosMes,
    reporteClasesHoy,
    reporteUltimosPagos,
    programacionesFuturas
  ] = await Promise.all([
    obtenerReporteClientes(),
    obtenerReporteMembresias({ estadoMembresia: 'Activa' }),
    obtenerReporteIngresos({ fechaInicio: primerDiaMes, fechaFin: hoy }),
    obtenerReporteClases({ fechaInicio: hoy, fechaFin: hoy }),
    obtenerReporteIngresos(),
    listarProgramacionesFuturas()
  ]);

  const membresiasPorVencer = reporteMembresiasActivas.detalle.filter(
    (m) => m.fecha_vencimiento >= hoy && m.fecha_vencimiento <= en7Dias
  );

  const proximasClasesConCupo = programacionesFuturas
    .filter((p) => p.cupos_disponibles > 0)
    .slice(0, 5);

  return {
    rol: 'Administrador',
    clientes_activos: reporteClientes.resumen.total_activos,
    membresias_activas: reporteMembresiasActivas.resumen.activas,
    membresias_por_vencer: membresiasPorVencer,
    ingresos_mes: reporteIngresosMes.resumen.total_pagado,
    clases_programadas_hoy: reporteClasesHoy.resumen.ocupacion,
    ultimos_pagos: reporteUltimosPagos.detalle.slice(0, 5),
    proximas_clases: proximasClasesConCupo
  };
}

async function construirDashboardEntrenador(idUsuario) {
  const entrenador = await buscarEntrenadorPorUsuario(idUsuario);
  if (!entrenador) {
    const error = new Error('El usuario no tiene un perfil de entrenador asociado');
    error.code = 'ENTRENADOR_PROFILE_NOT_FOUND';
    throw error;
  }

  const { hoy, en7Dias } = fechasReferencia();

  const [reporteClasesProximas, reporteRutinasActivas, reporteRutinasRecientes] = await Promise.all([
    obtenerReporteClases({ fkEntrenador: entrenador.id_entrenador, fechaInicio: hoy, fechaFin: en7Dias }),
    obtenerReporteRutinas({ fkEntrenador: entrenador.id_entrenador, estado: 'Activa' }),
    obtenerReporteRutinas({ fkEntrenador: entrenador.id_entrenador })
  ]);

  return {
    rol: 'Entrenador',
    clases_proximos_7_dias: reporteClasesProximas.resumen.ocupacion,
    rutinas_activas: reporteRutinasActivas.detalle.length,
    rutinas_recientes: reporteRutinasRecientes.detalle.slice(0, 5)
  };
}

async function construirDashboardCliente(idUsuario) {
  const { cliente, historial } = await listarMembresiasPorUsuario(idUsuario);
  const membresiaActiva = historial.find((m) => m.vigencia === 'Activa') || null;

  const { hoy } = fechasReferencia();

  const [reservas, reporteRutinaActiva] = await Promise.all([
    listarReservasPorCliente(cliente.id_cliente),
    obtenerReporteRutinas({ fkCliente: cliente.id_cliente, estado: 'Activa' })
  ]);

  const proximaReserva =
    reservas
      .filter((r) => r.estado_reserva === 'Confirmada' && r.fecha_clase >= hoy)
      .sort((a, b) => (a.fecha_clase + a.hora_inicio).localeCompare(b.fecha_clase + b.hora_inicio))[0] || null;

  return {
    rol: 'Cliente',
    membresia_vigente: membresiaActiva,
    proxima_reserva: proximaReserva,
    rutina_activa: reporteRutinaActiva.detalle[0] || null
  };
}

export async function obtenerDashboardController(req, res, next) {
  try {
    const usuarioAuth = req.usuarioAutenticado;

    let datos;
    if (usuarioAuth.nombre_rol === 'Administrador') {
      datos = await construirDashboardAdministrador();
    } else if (usuarioAuth.nombre_rol === 'Entrenador') {
      datos = await construirDashboardEntrenador(usuarioAuth.id_usuario);
    } else {
      datos = await construirDashboardCliente(usuarioAuth.id_usuario);
    }

    return successResponse(res, 200, 'Datos del dashboard obtenidos correctamente', datos);
  } catch (error) {
    if (error.code === 'CLIENT_PROFILE_NOT_FOUND') {
      return errorResponse(res, 404, error.message, error.code);
    }
    if (error.code === 'ENTRENADOR_PROFILE_NOT_FOUND') {
      return errorResponse(res, 404, error.message, error.code);
    }
    return next(error);
  }
}
