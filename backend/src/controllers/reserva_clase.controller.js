import {
  buscarReservaPorId,
  cancelarReservaSegura,
  crearReservaSegura,
  listarReservasPorCliente,
  marcarAsistioSegura
} from '../models/reserva_clase.model.js';
import { buscarClientePorUsuario } from '../models/cliente.model.js';
import { buscarEntrenadorPorUsuario } from '../models/entrenador.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

const ERRORES_RESERVA = {
  PROGRAMACION_NOT_FOUND: [404, 'La programación no existe'],
  PROGRAMACION_PASADA: [400, 'No se pueden reservar clases de fechas pasadas'],
  ALREADY_RESERVED: [409, 'Ya tienes una reserva confirmada para esta clase'],
  NO_CUPOS_DISPONIBLES: [409, 'No hay cupos disponibles para esta clase'],
  MEMBERSHIP_REQUIRED: [403, 'Se requiere una membresía activa para reservar clases'],
  ALREADY_CANCELLED: [409, 'La reserva ya está cancelada'],
  RESERVA_ASISTIDA: [409, 'No se puede cancelar una reserva con asistencia registrada'],
  RESERVA_CANCELADA: [400, 'La reserva está cancelada'],
  RESERVA_YA_ASISTIO: [400, 'La asistencia ya fue registrada'],
  CLASE_FUTURA: [400, 'No se puede marcar asistencia de una clase futura'],
  FORBIDDEN_CLASE_AJENA: [403, 'No puedes marcar asistencia de una clase que no es tuya']
};

/** Utilidad: resuelve el id_cliente del usuario autenticado */
async function resolverCliente(idUsuario) {
  return buscarClientePorUsuario(idUsuario);
}

/** Utilidad: verifica que el cliente tenga una membresía activa */
async function tieneMembresiaActiva(idCliente, conexion) {
  // Se usa el pool directamente (import pool dentro del modelo sería circular)
  // Hacemos la verificación aquí con una función importada desde membresia.model
  // Para mantener independencia, consultamos con pool desde cliente.model no disponible,
  // así que importamos pool directamente.
  const { pool } = await import('../config/database.js');
  const [filas] = await pool.execute(
    `SELECT id_membresia FROM membresia
     WHERE fk_cliente = ?
       AND estado_membresia = 'Activa'
       AND CURDATE() BETWEEN fecha_inicio AND fecha_vencimiento
     LIMIT 1`,
    [idCliente]
  );
  return filas.length > 0;
}

export async function crearReservaController(req, res, next) {
  const { fk_programacion } = req.body;

  const idProgramacion = Number(fk_programacion);
  if (isNaN(idProgramacion) || idProgramacion <= 0) {
    return errorResponse(res, 400, 'El ID de programación (fk_programacion) no es válido', 'VALIDATION_ERROR');
  }

  try {
    const usuarioAuth = req.usuarioAutenticado;

    // Traducir id_usuario → id_cliente
    const cliente = await resolverCliente(usuarioAuth.id_usuario);
    if (!cliente) {
      return errorResponse(
        res,
        404,
        'El usuario no tiene un perfil de cliente asociado',
        'CLIENT_PROFILE_NOT_FOUND'
      );
    }

    // Verificar membresía activa
    const activa = await tieneMembresiaActiva(cliente.id_cliente);
    if (!activa) {
      return errorResponse(
        res,
        403,
        'Se requiere una membresía activa para reservar clases',
        'MEMBERSHIP_REQUIRED'
      );
    }

    const reserva = await crearReservaSegura({
      fk_programacion: idProgramacion,
      fk_cliente: cliente.id_cliente
    });

    return successResponse(res, 201, 'Reserva creada exitosamente', reserva);
  } catch (error) {
    const info = ERRORES_RESERVA[error.code];
    if (info) {
      return errorResponse(res, info[0], info[1], error.code);
    }
    return next(error);
  }
}

export async function obtenerMisReservasController(req, res, next) {
  try {
    const usuarioAuth = req.usuarioAutenticado;
    const cliente = await resolverCliente(usuarioAuth.id_usuario);
    if (!cliente) {
      return errorResponse(
        res,
        404,
        'El usuario no tiene un perfil de cliente asociado',
        'CLIENT_PROFILE_NOT_FOUND'
      );
    }

    const reservas = await listarReservasPorCliente(cliente.id_cliente);
    return successResponse(res, 200, 'Reservas obtenidas correctamente', reservas);
  } catch (error) {
    return next(error);
  }
}

export async function cancelarReservaController(req, res, next) {
  const idReserva = Number(req.params.id);
  if (isNaN(idReserva) || idReserva <= 0) {
    return errorResponse(res, 400, 'El ID de reserva no es válido', 'INVALID_ID');
  }

  try {
    const usuarioAuth = req.usuarioAutenticado;

    // Obtener la reserva actual
    const reservaActual = await buscarReservaPorId(idReserva);
    if (!reservaActual) {
      return errorResponse(res, 404, 'Reserva no encontrada', 'RESERVA_NOT_FOUND');
    }

    // Si es Cliente, validar que la reserva le pertenece (403 si no)
    if (usuarioAuth.nombre_rol === 'Cliente') {
      const cliente = await resolverCliente(usuarioAuth.id_usuario);
      if (!cliente || reservaActual.fk_cliente !== cliente.id_cliente) {
        return errorResponse(
          res,
          403,
          'No tienes permisos para cancelar esta reserva',
          'FORBIDDEN'
        );
      }
    }
    // Administrador puede cancelar cualquier reserva sin validar propiedad

    const reservaCancelada = await cancelarReservaSegura(idReserva);
    if (!reservaCancelada) {
      return errorResponse(res, 404, 'Reserva no encontrada', 'RESERVA_NOT_FOUND');
    }

    return successResponse(res, 200, 'Reserva cancelada exitosamente', reservaCancelada);
  } catch (error) {
    const info = ERRORES_RESERVA[error.code];
    if (info) {
      return errorResponse(res, info[0], info[1], error.code);
    }
    return next(error);
  }
}

export async function marcarAsistioController(req, res, next) {
  const idReserva = Number(req.params.id);
  if (isNaN(idReserva) || idReserva <= 0) {
    return errorResponse(res, 400, 'El ID de reserva no es válido', 'INVALID_ID');
  }

  try {
    const usuarioAuth = req.usuarioAutenticado;
    let idEntrenador = null;

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
    }

    const reserva = await marcarAsistioSegura(idReserva, { idEntrenador });
    if (!reserva) {
      return errorResponse(res, 404, 'Reserva no encontrada', 'RESERVA_NOT_FOUND');
    }

    return successResponse(res, 200, 'Asistencia registrada exitosamente', reserva);
  } catch (error) {
    const info = ERRORES_RESERVA[error.code];
    if (info) {
      return errorResponse(res, info[0], info[1], error.code);
    }
    return next(error);
  }
}
