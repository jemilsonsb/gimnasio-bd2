import {
  obtenerReporteAsistencias as obtenerReporteAsistenciasModel,
  obtenerReporteClases as obtenerReporteClasesModel,
  obtenerReporteClientes as obtenerReporteClientesModel,
  obtenerReporteIngresos as obtenerReporteIngresosModel,
  obtenerReporteMembresias as obtenerReporteMembresiasModel,
  obtenerReporteRutinas as obtenerReporteRutinasModel
} from '../models/reporte.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function validarFecha(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return { valido: true, valor: undefined };
  }
  if (!FECHA_REGEX.test(String(valor)) || isNaN(Date.parse(valor))) {
    return { valido: false };
  }
  return { valido: true, valor: String(valor) };
}

function validarId(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return { valido: true, valor: undefined };
  }
  const numero = Number(valor);
  if (isNaN(numero) || numero <= 0) {
    return { valido: false };
  }
  return { valido: true, valor: numero };
}

export async function obtenerReporteIngresosController(req, res, next) {
  const { fecha_inicio, fecha_fin, fk_cliente, fk_plan, metodo_pago, estado_pago } = req.query;

  const vFechaInicio = validarFecha(fecha_inicio);
  const vFechaFin = validarFecha(fecha_fin);
  const vFkCliente = validarId(fk_cliente);
  const vFkPlan = validarId(fk_plan);

  if (!vFechaInicio.valido) {
    return errorResponse(res, 400, "fecha_inicio debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFechaFin.valido) {
    return errorResponse(res, 400, "fecha_fin debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFkCliente.valido) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }
  if (!vFkPlan.valido) {
    return errorResponse(res, 400, 'El ID de plan (fk_plan) no es válido', 'VALIDATION_ERROR');
  }

  try {
    const reporte = await obtenerReporteIngresosModel({
      fechaInicio: vFechaInicio.valor,
      fechaFin: vFechaFin.valor,
      fkCliente: vFkCliente.valor,
      fkPlan: vFkPlan.valor,
      metodoPago: metodo_pago || undefined,
      estadoPago: estado_pago || undefined
    });

    return successResponse(res, 200, 'Reporte de ingresos obtenido correctamente', reporte);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerReporteMembresiasController(req, res, next) {
  const { fecha_inicio, fecha_fin, fk_cliente, fk_plan, estado_membresia } = req.query;

  const vFechaInicio = validarFecha(fecha_inicio);
  const vFechaFin = validarFecha(fecha_fin);
  const vFkCliente = validarId(fk_cliente);
  const vFkPlan = validarId(fk_plan);

  if (!vFechaInicio.valido) {
    return errorResponse(res, 400, "fecha_inicio debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFechaFin.valido) {
    return errorResponse(res, 400, "fecha_fin debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFkCliente.valido) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }
  if (!vFkPlan.valido) {
    return errorResponse(res, 400, 'El ID de plan (fk_plan) no es válido', 'VALIDATION_ERROR');
  }

  try {
    const reporte = await obtenerReporteMembresiasModel({
      fechaInicio: vFechaInicio.valor,
      fechaFin: vFechaFin.valor,
      fkCliente: vFkCliente.valor,
      fkPlan: vFkPlan.valor,
      estadoMembresia: estado_membresia || undefined
    });

    return successResponse(res, 200, 'Reporte de membresías obtenido correctamente', reporte);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerReporteClientesController(req, res, next) {
  const { fecha_inicio, fecha_fin, estado } = req.query;

  const vFechaInicio = validarFecha(fecha_inicio);
  const vFechaFin = validarFecha(fecha_fin);

  if (!vFechaInicio.valido) {
    return errorResponse(res, 400, "fecha_inicio debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFechaFin.valido) {
    return errorResponse(res, 400, "fecha_fin debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }

  try {
    const reporte = await obtenerReporteClientesModel({
      fechaInicio: vFechaInicio.valor,
      fechaFin: vFechaFin.valor,
      estado: estado || undefined
    });

    return successResponse(res, 200, 'Reporte de clientes obtenido correctamente', reporte);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerReporteClasesController(req, res, next) {
  const { fecha_inicio, fecha_fin, fk_clase, fk_entrenador, fk_programacion, fk_cliente } = req.query;

  const vFechaInicio = validarFecha(fecha_inicio);
  const vFechaFin = validarFecha(fecha_fin);
  const vFkClase = validarId(fk_clase);
  const vFkEntrenador = validarId(fk_entrenador);
  const vFkProgramacion = validarId(fk_programacion);
  const vFkCliente = validarId(fk_cliente);

  if (!vFechaInicio.valido) {
    return errorResponse(res, 400, "fecha_inicio debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFechaFin.valido) {
    return errorResponse(res, 400, "fecha_fin debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFkClase.valido) {
    return errorResponse(res, 400, 'El ID de clase (fk_clase) no es válido', 'VALIDATION_ERROR');
  }
  if (!vFkEntrenador.valido) {
    return errorResponse(res, 400, 'El ID de entrenador (fk_entrenador) no es válido', 'VALIDATION_ERROR');
  }
  if (!vFkProgramacion.valido) {
    return errorResponse(res, 400, 'El ID de programación (fk_programacion) no es válido', 'VALIDATION_ERROR');
  }
  if (!vFkCliente.valido) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }

  try {
    const reporte = await obtenerReporteClasesModel({
      fechaInicio: vFechaInicio.valor,
      fechaFin: vFechaFin.valor,
      fkClase: vFkClase.valor,
      fkEntrenador: vFkEntrenador.valor,
      fkProgramacion: vFkProgramacion.valor,
      fkCliente: vFkCliente.valor
    });

    return successResponse(res, 200, 'Reporte de clases obtenido correctamente', reporte);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerReporteAsistenciasController(req, res, next) {
  const { fecha_inicio, fecha_fin, fk_cliente, fk_plan } = req.query;

  const vFechaInicio = validarFecha(fecha_inicio);
  const vFechaFin = validarFecha(fecha_fin);
  const vFkCliente = validarId(fk_cliente);
  const vFkPlan = validarId(fk_plan);

  if (!vFechaInicio.valido) {
    return errorResponse(res, 400, "fecha_inicio debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFechaFin.valido) {
    return errorResponse(res, 400, "fecha_fin debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFkCliente.valido) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }
  if (!vFkPlan.valido) {
    return errorResponse(res, 400, 'El ID de plan (fk_plan) no es válido', 'VALIDATION_ERROR');
  }

  try {
    const reporte = await obtenerReporteAsistenciasModel({
      fechaInicio: vFechaInicio.valor,
      fechaFin: vFechaFin.valor,
      fkCliente: vFkCliente.valor,
      fkPlan: vFkPlan.valor
    });

    return successResponse(res, 200, 'Reporte de asistencias obtenido correctamente', reporte);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerReporteRutinasController(req, res, next) {
  const { fk_entrenador, fk_cliente, estado, fecha_inicio, fecha_fin } = req.query;

  const vFechaInicio = validarFecha(fecha_inicio);
  const vFechaFin = validarFecha(fecha_fin);
  const vFkEntrenador = validarId(fk_entrenador);
  const vFkCliente = validarId(fk_cliente);

  if (!vFechaInicio.valido) {
    return errorResponse(res, 400, "fecha_inicio debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFechaFin.valido) {
    return errorResponse(res, 400, "fecha_fin debe tener el formato 'YYYY-MM-DD'", 'VALIDATION_ERROR');
  }
  if (!vFkEntrenador.valido) {
    return errorResponse(res, 400, 'El ID de entrenador (fk_entrenador) no es válido', 'VALIDATION_ERROR');
  }
  if (!vFkCliente.valido) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }

  try {
    const reporte = await obtenerReporteRutinasModel({
      fkEntrenador: vFkEntrenador.valor,
      fkCliente: vFkCliente.valor,
      estado: estado || undefined,
      fechaInicio: vFechaInicio.valor,
      fechaFin: vFechaFin.valor
    });

    return successResponse(res, 200, 'Reporte de rutinas obtenido correctamente', reporte);
  } catch (error) {
    return next(error);
  }
}
