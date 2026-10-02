import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerUsuarios() {
  return apiRequest('/usuarios', {
    headers: headersAutenticados()
  });
}

export function crearUsuario(datos) {
  return apiRequest('/usuarios', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}

export function actualizarEstadoUsuario(idUsuario, estado) {
  return apiRequest(`/usuarios/${idUsuario}/estado`, {
    method: 'PATCH',
    headers: headersAutenticados(),
    body: JSON.stringify({ estado })
  });
}

export function desbloquearUsuario(idUsuario) {
  return apiRequest(`/usuarios/${idUsuario}/desbloquear`, {
    method: 'PATCH',
    headers: headersAutenticados()
  });
}