import { buscarClasePorId, crearClase, listarClases } from '../models/clase.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export async function obtenerClasesController(req, res, next) {
  try {
    const clases = await listarClases();
    return successResponse(res, 200, 'Clases obtenidas correctamente', clases);
  } catch (error) {
    return next(error);
  }
}

export async function crearClaseController(req, res, next) {
  const { nombre_clase, descripcion, capacidad_maxima } = req.body;

  if (!nombre_clase || String(nombre_clase).trim() === '') {
    return errorResponse(res, 400, 'El nombre de la clase es obligatorio', 'VALIDATION_ERROR');
  }

  const capacidad = Number(capacidad_maxima);
  if (isNaN(capacidad) || capacidad <= 0) {
    return errorResponse(res, 400, 'La capacidad máxima debe ser un número mayor a 0', 'VALIDATION_ERROR');
  }

  try {
    const nuevaClase = await crearClase({
      nombre_clase: String(nombre_clase).trim(),
      descripcion: descripcion ? String(descripcion).trim() : null,
      capacidad_maxima: capacidad
    });
    return successResponse(res, 201, 'Clase creada exitosamente', nuevaClase);
  } catch (error) {
    return next(error);
  }
}
