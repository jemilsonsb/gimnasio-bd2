import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerTodasMembresias() {
  return apiRequest('/membresias', {
    headers: headersAutenticados()
  });
}

export function obtenerHistorialUsuario(idUsuario) {
  return apiRequest(`/membresias/usuario/${idUsuario}`, {
    headers: headersAutenticados()
  });
}

export function obtenerHistorialCliente(idCliente) {
  return apiRequest(`/membresias/cliente/${idCliente}`, {
    headers: headersAutenticados()
  });
}

export function asignarMembresia(datos) {
  return apiRequest('/membresias', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}

export function cancelarMembresia(idMembresia) {
  return apiRequest(`/membresias/${idMembresia}/cancelar`, {
    method: 'PATCH',
    headers: headersAutenticados()
  });
}
