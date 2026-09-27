import {
  agregarDetalleRutina,
  buscarRutinaPorId,
  crearRutina,
  listarDetallesRutina,
  listarRutinas,
  listarRutinasPorCliente
} from '../models/rutina.model.js';
import { buscarEntrenadorPorId, buscarEntrenadorPorUsuario } from '../models/entrenador.model.js';
import { buscarClientePorId, buscarClientePorUsuario } from '../models/cliente.model.js';
import { buscarEjercicioPorId } from '../models/ejercicio.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

const ESTADOS_RUTINA_PERMITIDOS = ['Activa', 'Finalizada', 'Pausada'];

export async function obtenerTodasRutinas(req, res, next) {
  try {
    const rutinas = await listarRutinas();
    return successResponse(res, 200, 'Rutinas obtenidas correctamente', rutinas);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerRutinasPorCliente(req, res, next) {
  const idUsuario = Number(req.params.id_usuario);

  if (isNaN(idUsuario) || idUsuario <= 0) {
    return errorResponse(res, 400, 'El ID de usuario no es válido', 'INVALID_ID');
  }

  const usuarioAuth = req.usuarioAutenticado;
  if (usuarioAuth?.nombre_rol === 'Cliente' && usuarioAuth?.id_usuario !== idUsuario) {
    return errorResponse(
      res,
      403,
      'No tienes permisos para consultar las rutinas de otro usuario',
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

    const rutinas = await listarRutinasPorCliente(cliente.id_cliente);
    return successResponse(res, 200, 'Rutinas del cliente obtenidas correctamente', {
      cliente,
      rutinas
    });
  } catch (error) {
    return next(error);
  }
}

export async function crearRutinaController(req, res, next) {
  const {
    fk_cliente,
    nombre_rutina,
    objetivo,
    fecha_inicio,
    fecha_fin,
    estado = 'Activa'
  } = req.body;

  const idCliente = Number(fk_cliente);
  if (isNaN(idCliente) || idCliente <= 0) {
    return errorResponse(res, 400, 'El ID de cliente (fk_cliente) no es válido', 'VALIDATION_ERROR');
  }

  if (!nombre_rutina || String(nombre_rutina).trim() === '') {
    return errorResponse(res, 400, 'El nombre de la rutina es obligatorio', 'VALIDATION_ERROR');
  }

  if (estado && !ESTADOS_RUTINA_PERMITIDOS.includes(estado)) {
    return errorResponse(
      res,
      400,
      `El estado debe ser uno de: ${ESTADOS_RUTINA_PERMITIDOS.join(', ')}`,
      'VALIDATION_ERROR'
    );
  }

  try {
    // 1. Validar perfil de cliente
    const cliente = await buscarClientePorId(idCliente);
    if (!cliente) {
      return errorResponse(
        res,
        404,
        'El cliente no existe o no tiene un perfil de cliente asociado',
        'CLIENT_PROFILE_NOT_FOUND'
      );
    }

    // 2. Determinar fk_entrenador según rol
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
      // Rol Administrador: debe proporcionar fk_entrenador
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
        return errorResponse(
          res,
          404,
          'El entrenador seleccionado no existe',
          'ENTRENADOR_PROFILE_NOT_FOUND'
        );
      }
      idEntrenador = perfilEntrenador.id_entrenador;
    }

    const nuevaRutina = await crearRutina({
      fk_cliente: idCliente,
      fk_entrenador: idEntrenador,
      nombre_rutina: String(nombre_rutina).trim(),
      objetivo: objetivo ? String(objetivo).trim() : null,
      fecha_inicio: fecha_inicio || null,
      fecha_fin: fecha_fin || null,
      estado
    });

    return successResponse(res, 201, 'Rutina creada exitosamente', nuevaRutina);
  } catch (error) {
    return next(error);
  }
}

export async function agregarDetalleController(req, res, next) {
  const idRutina = Number(req.params.id);
  if (isNaN(idRutina) || idRutina <= 0) {
    return errorResponse(res, 400, 'El ID de rutina no es válido', 'INVALID_ID');
  }

  const { fk_ejercicio, dia_semana, series, repeticiones, descanso_segundos } = req.body;

  const idEjercicio = Number(fk_ejercicio);
  if (isNaN(idEjercicio) || idEjercicio <= 0) {
    return errorResponse(res, 400, 'El ID de ejercicio (fk_ejercicio) no es válido', 'VALIDATION_ERROR');
  }

  if (!dia_semana || String(dia_semana).trim() === '') {
    return errorResponse(res, 400, 'El día de la semana es obligatorio', 'VALIDATION_ERROR');
  }

  const seriesNum = Number(series);
  if (isNaN(seriesNum) || seriesNum <= 0) {
    return errorResponse(res, 400, 'El número de series debe ser mayor a 0', 'VALIDATION_ERROR');
  }

  const repeticionesNum = Number(repeticiones);
  if (isNaN(repeticionesNum) || repeticionesNum <= 0) {
    return errorResponse(res, 400, 'El número de repeticiones debe ser mayor a 0', 'VALIDATION_ERROR');
  }

  try {
    const rutina = await buscarRutinaPorId(idRutina);
    if (!rutina) {
      return errorResponse(res, 404, 'Rutina no encontrada', 'ROUTINE_NOT_FOUND');
    }

    const ejercicio = await buscarEjercicioPorId(idEjercicio);
    if (!ejercicio) {
      return errorResponse(res, 404, 'Ejercicio no encontrado', 'EJERCICIO_NOT_FOUND');
    }

    const detalle = await agregarDetalleRutina({
      fk_rutina: idRutina,
      fk_ejercicio: idEjercicio,
      dia_semana: String(dia_semana).trim(),
      series: seriesNum,
      repeticiones: repeticionesNum,
      descanso_segundos: descanso_segundos !== undefined && descanso_segundos !== null ? Number(descanso_segundos) : null
    });

    return successResponse(res, 201, 'Ejercicio agregado a la rutina exitosamente', detalle);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerDetallesController(req, res, next) {
  const idRutina = Number(req.params.id);
  if (isNaN(idRutina) || idRutina <= 0) {
    return errorResponse(res, 400, 'El ID de rutina no es válido', 'INVALID_ID');
  }

  try {
    const rutina = await buscarRutinaPorId(idRutina);
    if (!rutina) {
      return errorResponse(res, 404, 'Rutina no encontrada', 'ROUTINE_NOT_FOUND');
    }

    const usuarioAuth = req.usuarioAutenticado;
    if (usuarioAuth?.nombre_rol === 'Cliente') {
      const cliente = await buscarClientePorUsuario(usuarioAuth.id_usuario);
      if (!cliente || rutina.fk_cliente !== cliente.id_cliente) {
        return errorResponse(
          res,
          403,
          'No tienes permisos para consultar el detalle de esta rutina',
          'FORBIDDEN'
        );
      }
    }

    const detalles = await listarDetallesRutina(idRutina);
    return successResponse(res, 200, 'Detalles de la rutina obtenidos correctamente', {
      rutina,
      detalles
    });
  } catch (error) {
    return next(error);
  }
}
