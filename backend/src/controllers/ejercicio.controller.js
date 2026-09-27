import {
  buscarEjercicioPorId,
  crearEjercicio,
  listarEjercicios
} from '../models/ejercicio.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export async function obtenerEjercicios(req, res, next) {
  try {
    const ejercicios = await listarEjercicios();
    return successResponse(res, 200, 'Ejercicios obtenidos correctamente', ejercicios);
  } catch (error) {
    return next(error);
  }
}

export async function crearEjercicioController(req, res, next) {
  const { nombre_ejercicio, grupo_muscular, descripcion } = req.body;

  if (!nombre_ejercicio || String(nombre_ejercicio).trim() === '') {
    return errorResponse(res, 400, 'El nombre del ejercicio es obligatorio', 'VALIDATION_ERROR');
  }

  if (!grupo_muscular || String(grupo_muscular).trim() === '') {
    return errorResponse(res, 400, 'El grupo muscular es obligatorio', 'VALIDATION_ERROR');
  }

  try {
    const nuevoEjercicio = await crearEjercicio({
      nombre_ejercicio: String(nombre_ejercicio).trim(),
      grupo_muscular: String(grupo_muscular).trim(),
      descripcion: descripcion ? String(descripcion).trim() : null
    });

    return successResponse(res, 201, 'Ejercicio creado exitosamente', nuevoEjercicio);
  } catch (error) {
    return next(error);
  }
}
