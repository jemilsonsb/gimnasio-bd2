import { buscarClientePorId, listarClientes } from '../models/cliente.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export async function obtenerClientes(req, res, next) {
  try {
    const soloActivos = req.query.todos !== 'true';
    const clientes = await listarClientes({ soloActivos });
    return successResponse(res, 200, 'Clientes obtenidos correctamente', clientes);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerClientePorId(req, res, next) {
  try {
    const idCliente = Number(req.params.id);
    if (isNaN(idCliente) || idCliente <= 0) {
      return errorResponse(res, 400, 'El ID de cliente no es válido', 'INVALID_ID');
    }

    const cliente = await buscarClientePorId(idCliente);
    if (!cliente) {
      return errorResponse(res, 404, 'Cliente no encontrado', 'CLIENT_NOT_FOUND');
    }

    return successResponse(res, 200, 'Cliente obtenido correctamente', cliente);
  } catch (error) {
    return next(error);
  }
}