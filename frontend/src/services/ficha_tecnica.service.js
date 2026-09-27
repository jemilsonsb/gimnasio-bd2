import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerFichaTecnica(idUsuario) {
  return apiRequest(`/ficha-tecnica/${idUsuario}`, {
    headers: headersAutenticados()
  });
}

export function guardarFichaTecnica(datos) {
  return apiRequest('/ficha-tecnica', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}
