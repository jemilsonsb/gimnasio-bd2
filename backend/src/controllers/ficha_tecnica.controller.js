import {
  buscarFichaPorCliente,
  upsertFichaTecnica
} from '../models/ficha_tecnica.model.js';
import { buscarClientePorId, buscarClientePorUsuario } from '../models/cliente.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export async function obtenerFichaTecnica(req, res, next) {
  const idUsuario = Number(req.params.id_usuario);

  if (isNaN(idUsuario) || idUsuario <= 0) {
    return errorResponse(res, 400, 'El ID de usuario no es válido', 'INVALID_ID');
  }

  const usuarioAuth = req.usuarioAutenticado;
  if (usuarioAuth?.nombre_rol === 'Cliente' && usuarioAuth?.id_usuario !== idUsuario) {
    return errorResponse(
      res,
      403,
      'No tienes permisos para consultar la ficha técnica de otro usuario',
      'FORBIDDEN'
    );
  }

  try {
    const cliente = await buscarClientePorUsuario(idUsuario);
    if (!cliente) {
      return errorResponse(
        res,
        404,
        'El usuario no tiene un perfil de cliente asociado',
        'CLIENT_PROFILE_NOT_FOUND'
      );
    }

    const ficha = await buscarFichaPorCliente(cliente.id_cliente);
    if (!ficha) {
      return errorResponse(res, 404, 'Ficha técnica no encontrada', 'FICHA_NOT_FOUND');
    }

    return successResponse(res, 200, 'Ficha técnica obtenida correctamente', ficha);
  } catch (error) {
    return next(error);
  }
}

export async function crearOActualizarFicha(req, res, next) {
  const {
    fk_cliente,
    peso_kg,
    estatura,
    porcentaje_grasa,
    observaciones_medicas,
    objetivos
  } = req.body;

  const idCliente = Number(fk_cliente);
  if (isNaN(idCliente) || idCliente <= 0) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }

  const peso = Number(peso_kg);
  if (isNaN(peso) || peso <= 0) {
    return errorResponse(res, 400, 'El peso en kg debe ser un número mayor a 0', 'VALIDATION_ERROR');
  }

  const est = Number(estatura);
  if (isNaN(est) || est <= 0) {
    return errorResponse(res, 400, 'La estatura debe ser un número mayor a 0', 'VALIDATION_ERROR');
  }

  let grasa = null;
  if (porcentaje_grasa !== undefined && porcentaje_grasa !== null && String(porcentaje_grasa).trim() !== '') {
    grasa = Number(porcentaje_grasa);
    if (isNaN(grasa) || grasa < 0) {
      return errorResponse(res, 400, 'El porcentaje de grasa debe ser un número válido', 'VALIDATION_ERROR');
    }
  }

  try {
    const cliente = await buscarClientePorId(idCliente);
    if (!cliente) {
      return errorResponse(
        res,
        404,
        'El cliente no existe o no tiene un perfil de cliente asociado',
        'CLIENT_PROFILE_NOT_FOUND'
      );
    }

    const fichaGuardada = await upsertFichaTecnica({
      fk_cliente: idCliente,
      peso_kg: peso,
      estatura: est,
      porcentaje_grasa: grasa,
      observaciones_medicas: observaciones_medicas ? String(observaciones_medicas).trim() : null,
      objetivos: objetivos ? String(objetivos).trim() : null
    });

    return successResponse(res, 200, 'Ficha técnica guardada exitosamente', fichaGuardada);
  } catch (error) {
    return next(error);
  }
}
