import {
  buscarMembresiaPorId,
  cancelarMembresia,
  editarMembresia,
  listarMembresiasPorCliente,
  listarMembresiasPorUsuario,
  listarTodasMembresias,
  registrarMembresia
} from '../models/membresia.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export async function crearMembresia(req, res, next) {
  const { fk_cliente, fk_plan, fecha_inicio } = req.body;

  const idCliente = Number(fk_cliente);
  const idPlan = Number(fk_plan);

  if (isNaN(idCliente) || idCliente <= 0) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }

  if (isNaN(idPlan) || idPlan <= 0) {
    return errorResponse(res, 400, 'El ID de plan (fk_plan) no es válido', 'VALIDATION_ERROR');
  }

  if (fecha_inicio !== undefined && fecha_inicio !== null && fecha_inicio !== '') {
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(String(fecha_inicio)) || isNaN(Date.parse(fecha_inicio))) {
      return errorResponse(
        res,
        400,
        "La fecha de inicio debe tener el formato válido 'YYYY-MM-DD'",
        'VALIDATION_ERROR'
      );
    }
  }

  try {
    const membresia = await registrarMembresia({
      fk_cliente: idCliente,
      fk_plan: idPlan,
      fecha_inicio
    });

    return successResponse(res, 201, 'Membresía asignada exitosamente', membresia);
  } catch (error) {
    if (error.code === 'CLIENT_NOT_FOUND') {
      return errorResponse(res, 404, error.message, error.code);
    }
    if (error.code === 'INACTIVE_USER') {
      return errorResponse(res, 400, error.message, error.code);
    }
    if (error.code === 'INVALID_ROLE') {
      return errorResponse(res, 400, error.message, error.code);
    }
    if (error.code === 'PLAN_NOT_FOUND') {
      return errorResponse(res, 404, error.message, error.code);
    }
    if (error.code === 'PLAN_INACTIVE') {
      return errorResponse(res, 400, error.message, error.code);
    }
    return next(error);
  }
}

export async function obtenerHistorialUsuario(req, res, next) {
  try {
    const idUsuario = Number(req.params.id_usuario);
    if (isNaN(idUsuario) || idUsuario <= 0) {
      return errorResponse(res, 400, 'El ID de usuario no es válido', 'INVALID_ID');
    }

    // Regla de autorización: Administrador puede consultar cualquier usuario;
    // un Cliente solo puede consultar su propio historial basado en su id_usuario de sesión.
    const usuarioAuth = req.usuarioAutenticado;
    if (usuarioAuth?.nombre_rol !== 'Administrador' && usuarioAuth?.id_usuario !== idUsuario) {
      return errorResponse(
        res,
        403,
        'No tienes permisos para consultar las membresías de otro usuario',
        'FORBIDDEN'
      );
    }

    const resultado = await listarMembresiasPorUsuario(idUsuario);

    const membresiaActiva = resultado.historial.find((m) => m.vigencia === 'Activa') || null;

    return successResponse(res, 200, 'Historial de membresías obtenido correctamente', {
      cliente: resultado.cliente,
      tiene_membresia_activa: Boolean(membresiaActiva),
      membresia_activa: membresiaActiva,
      historial: resultado.historial
    });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return errorResponse(res, 404, error.message, error.code);
    }
    if (error.code === 'CLIENT_PROFILE_NOT_FOUND') {
      return errorResponse(res, 404, error.message, error.code);
    }
    return next(error);
  }
}

export async function obtenerHistorialCliente(req, res, next) {
  try {
    const idCliente = Number(req.params.id_cliente);
    if (isNaN(idCliente) || idCliente <= 0) {
      return errorResponse(res, 400, 'El ID de cliente no es válido', 'INVALID_ID');
    }

    const resultado = await listarMembresiasPorCliente(idCliente);
    if (!resultado) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CLIENT_NOT_FOUND');
    }

    const membresiaActiva = resultado.historial.find((m) => m.vigencia === 'Activa') || null;

    return successResponse(res, 200, 'Historial de membresías obtenido correctamente', {
      cliente: resultado.cliente,
      tiene_membresia_activa: Boolean(membresiaActiva),
      membresia_activa: membresiaActiva,
      historial: resultado.historial
    });
  } catch (error) {
    return next(error);
  }
}

export async function obtenerTodasMembresias(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const membresias = await listarTodasMembresias({ limit, offset });
    return successResponse(res, 200, 'Membresías obtenidas correctamente', membresias);
  } catch (error) {
    return next(error);
  }
}

export async function cancelarMembresiaController(req, res, next) {
  try {
    const idMembresia = Number(req.params.id);
    if (isNaN(idMembresia) || idMembresia <= 0) {
      return errorResponse(res, 400, 'El ID de la membresía no es válido', 'INVALID_ID');
    }

    const membresiaExistente = await buscarMembresiaPorId(idMembresia);
    if (!membresiaExistente) {
      return errorResponse(res, 404, 'Membresía no encontrada', 'MEMBERSHIP_NOT_FOUND');
    }

    const cancelada = await cancelarMembresia(idMembresia);
    return successResponse(res, 200, 'Membresía cancelada correctamente', cancelada);
  } catch (error) {
    return next(error);
  }
}

export async function editarMembresiaController(req, res, next) {
  try {
    const idMembresia = Number(req.params.id);
    if (isNaN(idMembresia) || idMembresia <= 0) {
      return errorResponse(res, 400, 'El ID de la membresía no es válido', 'INVALID_ID');
    }

    const { fk_plan, fecha_inicio } = req.body;

    // Debe llegarse al menos un campo a editar
    if (fk_plan === undefined && fecha_inicio === undefined) {
      return errorResponse(
        res,
        400,
        'Debes enviar al menos uno de los campos: fk_plan o fecha_inicio',
        'VALIDATION_ERROR'
      );
    }

    // Validar fk_plan si se envía
    if (fk_plan !== undefined) {
      const idPlan = Number(fk_plan);
      if (isNaN(idPlan) || idPlan <= 0) {
        return errorResponse(res, 400, 'El ID de plan (fk_plan) no es válido', 'VALIDATION_ERROR');
      }
    }

    // Validar formato de fecha_inicio si se envía (YYYY-MM-DD)
    if (fecha_inicio !== undefined && fecha_inicio !== null && fecha_inicio !== '') {
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(String(fecha_inicio)) || isNaN(Date.parse(fecha_inicio))) {
        return errorResponse(
          res,
          400,
          "La fecha de inicio debe tener el formato válido 'YYYY-MM-DD'",
          'VALIDATION_ERROR'
        );
      }
    }

    const membresiaActualizada = await editarMembresia(idMembresia, { fk_plan, fecha_inicio });

    if (!membresiaActualizada) {
      return errorResponse(res, 404, 'Membresía no encontrada', 'MEMBERSHIP_NOT_FOUND');
    }

    return successResponse(res, 200, 'Membresía actualizada correctamente', membresiaActualizada);
  } catch (error) {
    if (error.code === 'MEMBERSHIP_CANCELLED') {
      return errorResponse(res, 400, error.message, error.code);
    }
    if (error.code === 'PLAN_NOT_FOUND') {
      return errorResponse(res, 404, error.message, error.code);
    }
    if (error.code === 'PLAN_INACTIVE') {
      return errorResponse(res, 400, error.message, error.code);
    }
    return next(error);
  }
}
