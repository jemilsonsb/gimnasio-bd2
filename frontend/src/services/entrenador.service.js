import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerEntrenadores() {
  return apiRequest('/entrenadores', {
    headers: headersAutenticados()
  });
}
