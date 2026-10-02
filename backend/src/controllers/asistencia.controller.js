import { pool } from '../config/database.js';
import { obtenerResumenAsistencias, registrarIngreso } from '../models/asistencia.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

const MES_REGEX = /^\d{4}-\d{2}$/;

async function buscarClientePorUsuario(idUsuario) {
  const [filas] = await pool.execute(
    'SELECT id_cliente FROM cliente WHERE fk_usuario = ? LIMIT 1',
    [idUsuario]
  );
  return filas[0] || null;
}

export async function crearAsistencia(req, res, next) {
  const idCliente = Number(req.body.fk_cliente);

  if (isNaN(idCliente) || idCliente <= 0) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }

  try {
    const resultado = await registrarIngreso({
      fk_cliente: idCliente,
      fk_usuario_registro: req.usuarioAutenticado.id_usuario
    });

    return successResponse(res, 201, 'Ingreso registrado correctamente', resultado);
  } catch (error) {
    if (error.code === 'CLIENT_NOT_FOUND') {
      return errorResponse(res, 404, error.message, error.code);
    }
    if (error.code === 'MEMBERSHIP_REQUIRED') {
      return errorResponse(res, 403, error.message, error.code);
    }
    if (error.code === 'NO_ENTRIES_LEFT') {
      return errorResponse(res, 400, error.message, error.code);
    }
    if (error.code === 'ALREADY_CHECKED_IN') {
      return errorResponse(res, 409, error.message, error.code);
    }
    return next(error);
  }
}

export async function obtenerMisAsistencias(req, res, next) {
  try {
    const { mes } = req.query;
    if (mes !== undefined && !MES_REGEX.test(String(mes))) {
      return errorResponse(res, 400, "El mes debe tener el formato 'YYYY-MM'", 'VALIDATION_ERROR');
    }

    const cliente = await buscarClientePorUsuario(req.usuarioAutenticado.id_usuario);
    if (!cliente) {
      return errorResponse(
        res,
        404,
        'El usuario no tiene un perfil de cliente asociado',
        'CLIENT_PROFILE_NOT_FOUND'
      );
    }

    const resumen = await obtenerResumenAsistencias({ fk_cliente: cliente.id_cliente, mes });
    return successResponse(res, 200, 'Asistencias obtenidas correctamente', resumen);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerAsistenciasCliente(req, res, next) {
  try {
    const idCliente = Number(req.params.id_cliente);
    if (isNaN(idCliente) || idCliente <= 0) {
      return errorResponse(res, 400, 'El ID de cliente no es válido', 'INVALID_ID');
    }

    const { mes } = req.query;
    if (mes !== undefined && !MES_REGEX.test(String(mes))) {
      return errorResponse(res, 400, "El mes debe tener el formato 'YYYY-MM'", 'VALIDATION_ERROR');
    }

    const resumen = await obtenerResumenAsistencias({ fk_cliente: idCliente, mes });
    return successResponse(res, 200, 'Asistencias obtenidas correctamente', resumen);
  } catch (error) {
    return next(error);
  }
}
