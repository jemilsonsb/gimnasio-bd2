import {
  buscarProgramacionPorId,
  crearProgramacion,
  listarProgramaciones,
  listarProgramacionesFuturas
} from '../models/programacion_clase.model.js';
import { buscarClasePorId } from '../models/clase.model.js';
import { buscarEntrenadorPorId, buscarEntrenadorPorUsuario } from '../models/entrenador.model.js';
import { listarReservasPorProgramacion } from '../models/reserva_clase.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

// Regex para validar formato HH:MM o HH:MM:SS
const HORA_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;
// Regex para validar formato YYYY-MM-DD
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function obtenerProgramacionesController(req, res, next) {
  try {
    const { futuras } = req.query;
    const programaciones = futuras === 'true'
      ? await listarProgramacionesFuturas()
      : await listarProgramaciones();
    return successResponse(res, 200, 'Programaciones obtenidas correctamente', programaciones);
  } catch (error) {
    return next(error);
  }
}

export async function crearProgramacionController(req, res, next) {
  const { fk_clase, fecha, hora_inicio, hora_fin, cupos_disponibles } = req.body;

  const idClase = Number(fk_clase);
  if (isNaN(idClase) || idClase <= 0) {
    return errorResponse(res, 400, 'El ID de clase (fk_clase) no es válido', 'VALIDATION_ERROR');
  }

  if (!fecha || !FECHA_REGEX.test(fecha)) {
    return errorResponse(res, 400, 'La fecha debe tener formato YYYY-MM-DD', 'VALIDATION_ERROR');
  }

  if (!hora_inicio || !HORA_REGEX.test(hora_inicio)) {
    return errorResponse(res, 400, 'hora_inicio debe tener formato HH:MM', 'VALIDATION_ERROR');
  }

  if (!hora_fin || !HORA_REGEX.test(hora_fin)) {
    return errorResponse(res, 400, 'hora_fin debe tener formato HH:MM', 'VALIDATION_ERROR');
  }

  if (hora_fin <= hora_inicio) {
    return errorResponse(res, 400, 'hora_fin debe ser posterior a hora_inicio', 'VALIDATION_ERROR');
  }

  const cupos = Number(cupos_disponibles);
  if (isNaN(cupos) || cupos <= 0) {
    return errorResponse(res, 400, 'Los cupos disponibles deben ser un número mayor a 0', 'VALIDATION_ERROR');
  }

  try {
    // Verificar clase
    const clase = await buscarClasePorId(idClase);
    if (!clase) {
      return errorResponse(res, 404, 'La clase no existe', 'CLASE_NOT_FOUND');
    }

    // Validar que cupos no supere capacidad_maxima
    if (cupos > clase.capacidad_maxima) {
      return errorResponse(
        res,
        400,
        `Los cupos disponibles no pueden superar la capacidad máxima de la clase (${clase.capacidad_maxima})`,
        'VALIDATION_ERROR'
      );
    }

    // Determinar fk_entrenador según rol
    let idEntrenador;
    const usuarioAuth = req.usuarioAutenticado;

    if (usuarioAuth.nombre_rol === 'Entrenador') {
      const perfilEntrenador = await buscarEntrenadorPorUsuario(usuarioAuth.id_usuario);
      if (!perfilEntrenador) {
        return errorResponse(
          res,
          404,
          'El usuario no tiene un perfil de entrenador asociado',
          'ENTRENADOR_PROFILE_NOT_FOUND'
        );
      }
      idEntrenador = perfilEntrenador.id_entrenador;
    } else {
      // Administrador: debe proporcionar fk_entrenador
      const fkEntrenadorBody = Number(req.body.fk_entrenador);
      if (isNaN(fkEntrenadorBody) || fkEntrenadorBody <= 0) {
        return errorResponse(
          res,
          400,
          'El ID de entrenador (fk_entrenador) es obligatorio para administradores',
          'VALIDATION_ERROR'
        );
      }
      const perfilEntrenador = await buscarEntrenadorPorId(fkEntrenadorBody);
      if (!perfilEntrenador) {
        return errorResponse(res, 404, 'El entrenador seleccionado no existe', 'ENTRENADOR_PROFILE_NOT_FOUND');
      }
      idEntrenador = perfilEntrenador.id_entrenador;
    }

    const nuevaProgramacion = await crearProgramacion({
      fk_clase: idClase,
      fk_entrenador: idEntrenador,
      fecha,
      hora_inicio,
      hora_fin,
      cupos_disponibles: cupos
    });

    return successResponse(res, 201, 'Programación creada exitosamente', nuevaProgramacion);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerReservasDeProgramacionController(req, res, next) {
  const idProgramacion = Number(req.params.id);
  if (isNaN(idProgramacion) || idProgramacion <= 0) {
    return errorResponse(res, 400, 'El ID de programación no es válido', 'INVALID_ID');
  }

  try {
    const programacion = await buscarProgramacionPorId(idProgramacion);
    if (!programacion) {
      return errorResponse(res, 404, 'Programación no encontrada', 'PROGRAMACION_NOT_FOUND');
    }

    const reservas = await listarReservasPorProgramacion(idProgramacion);
    return successResponse(res, 200, 'Reservas de la programación obtenidas correctamente', {
      programacion,
      reservas
    });
  } catch (error) {
    return next(error);
  }
}
