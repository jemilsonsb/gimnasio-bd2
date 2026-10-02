import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function registrarAsistencia(datos) {
  return apiRequest('/asistencias', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}

export function obtenerMisAsistencias(mes) {
  const query = mes ? `?mes=${mes}` : '';
  return apiRequest(`/asistencias/mis-asistencias${query}`, {
    headers: headersAutenticados()
  });
}

export function obtenerAsistenciasCliente(idCliente, mes) {
  const query = mes ? `?mes=${mes}` : '';
  return apiRequest(`/asistencias/cliente/${idCliente}${query}`, {
    headers: headersAutenticados()
  });
}
