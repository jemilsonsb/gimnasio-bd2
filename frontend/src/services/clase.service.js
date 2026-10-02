import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function parsearErrorBackend(err) {
  if (!err) return 'Ocurrió un error inesperado.';

  const codigo = err.codigo || err.code;
  const mensajeBackend = err.mensaje || err.message;

  switch (codigo) {
    case 'MEMBERSHIP_REQUIRED':
      return 'Se requiere una membresía activa para poder reservar una clase.';
    case 'NO_SPOTS_AVAILABLE':
      return 'No hay cupos disponibles para esta clase.';
    case 'ALREADY_RESERVED':
      return 'Ya tienes una reserva confirmada para esta clase.';
    case 'CLIENT_PROFILE_NOT_FOUND':
      return 'No se encontró tu perfil de cliente registrado en el sistema.';
    case 'ENTRENADOR_PROFILE_NOT_FOUND':
      return 'El usuario seleccionado no tiene un perfil de entrenador asociado.';
    default:
      return mensajeBackend || 'Error al procesar la solicitud.';
  }
}

export function obtenerClases() {
  return apiRequest('/clases', {
    headers: headersAutenticados()
  });
}

export function crearClase(datos) {
  return apiRequest('/clases', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}

export function obtenerProgramaciones(futuras = false) {
  const queryParam = futuras ? '?futuras=true' : '';
  return apiRequest(`/programaciones${queryParam}`, {
    headers: headersAutenticados()
  });
}

export function crearProgramacion(datos) {
  return apiRequest('/programaciones', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}

export function obtenerReservasDeProgramacion(idProgramacion) {
  return apiRequest(`/programaciones/${idProgramacion}/reservas`, {
    headers: headersAutenticados()
  });
}

export function crearReserva(fk_programacion) {
  return apiRequest('/reservas', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify({ fk_programacion })
  });
}

export function obtenerMisReservas() {
  return apiRequest('/reservas/mis-reservas', {
    headers: headersAutenticados()
  });
}

export function cancelarReserva(idReserva) {
  return apiRequest(`/reservas/${idReserva}/cancelar`, {
    method: 'PATCH',
    headers: headersAutenticados()
  });
}

export function marcarAsistio(idReserva) {
  return apiRequest(`/reservas/${idReserva}/asistio`, {
    method: 'PATCH',
    headers: headersAutenticados()
  });
}
