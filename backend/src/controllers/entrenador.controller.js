import { listarEntrenadores } from '../models/entrenador.model.js';
import { successResponse } from '../utils/api-response.js';

export async function obtenerEntrenadores(req, res, next) {
  try {
    const soloActivos = req.query.todos !== 'true';
    const entrenadores = await listarEntrenadores({ soloActivos });
    return successResponse(res, 200, 'Entrenadores obtenidos correctamente', entrenadores);
  } catch (error) {
    return next(error);
  }
}
