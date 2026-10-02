import {
  buscarClientePorUsuario,
  buscarMembresiaPorId
} from '../models/membresia.model.js';
import {
  listarPagosPorMembresia,
  listarTodosLosPagos,
  registrarPago
} from '../models/pago.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export const METODOS_PERMITIDOS = ['Efectivo', 'Tarjeta', 'Transferencia'];
export const ESTADOS_PERMITIDOS = ['Pagado', 'Pendiente', 'Rechazado'];

export async function crearPago(req, res, next) {
  try {
    const { fk_membresia, monto, metodo_pago, estado_pago, fecha_pago } = req.body;

    const idMembresia = Number(fk_membresia);
    if (isNaN(idMembresia) || idMembresia <= 0) {
      return errorResponse(res, 400, 'El ID de membresía (fk_membresia) no es válido', 'VALIDATION_ERROR');
    }

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return errorResponse(res, 400, 'El monto debe ser un número mayor a 0', 'VALIDATION_ERROR');
    }

    if (!METODOS_PERMITIDOS.includes(metodo_pago)) {
      return errorResponse(
        res,
        400,
        `El método de pago no es válido. Opciones permitidas: ${METODOS_PERMITIDOS.join(', ')}`,
        'VALIDATION_ERROR'
      );
    }

    let estadoFinal = 'Pagado';
    if (estado_pago !== undefined && estado_pago !== null && String(estado_pago).trim() !== '') {
      if (!ESTADOS_PERMITIDOS.includes(estado_pago)) {
        return errorResponse(
          res,
          400,
          `El estado de pago no es válido. Opciones permitidas: ${ESTADOS_PERMITIDOS.join(', ')}`,
          'VALIDATION_ERROR'
        );
      }
      estadoFinal = estado_pago;
    }

    // Verificar existencia de la membresía
    const membresiaExistente = await buscarMembresiaPorId(idMembresia);
    if (!membresiaExistente) {
      return errorResponse(res, 404, 'La membresía especificada no existe', 'MEMBERSHIP_NOT_FOUND');
    }

    const nuevoPago = await registrarPago({
      fk_membresia: idMembresia,
      monto: montoNum,
      metodo_pago,
      estado_pago: estadoFinal,
      fecha_pago: fecha_pago || null
    });

    return successResponse(res, 201, 'Pago registrado exitosamente', nuevoPago);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerTodosLosPagos(_req, res, next) {
  try {
    const pagos = await listarTodosLosPagos();
    return successResponse(res, 200, 'Pagos obtenidos exitosamente', pagos);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerPagosPorMembresia(req, res, next) {
  try {
    const idMembresia = Number(req.params.id_membresia);
    if (isNaN(idMembresia) || idMembresia <= 0) {
      return errorResponse(res, 400, 'El ID de membresía no es válido', 'INVALID_ID');
    }

    // Verificar existencia de la membresía
    const membresia = await buscarMembresiaPorId(idMembresia);
    if (!membresia) {
      return errorResponse(res, 404, 'Membresía no encontrada', 'MEMBERSHIP_NOT_FOUND');
    }

    // Control de autorización según rol
    const usuarioAuth = req.usuarioAutenticado;
    if (usuarioAuth?.nombre_rol !== 'Administrador') {
      // Es rol Cliente: verificar si esta membresía le pertenece
      const clienteAsociado = await buscarClientePorUsuario(usuarioAuth.id_usuario);
      if (!clienteAsociado || clienteAsociado.id_cliente !== membresia.fk_cliente) {
        return errorResponse(
          res,
          403,
          'No tienes permisos para consultar los pagos de esta membresía',
          'FORBIDDEN'
        );
      }
    }

    const pagos = await listarPagosPorMembresia(idMembresia);
    return successResponse(res, 200, 'Historial de pagos obtenido exitosamente', {
      id_membresia: membresia.id_membresia,
      plan: membresia.nombre_plan,
      nombre_usuario: membresia.nombre_usuario,
      precio_plan: membresia.precio_pagado,
      pagos
    });
  } catch (error) {
    return next(error);
  }
}
