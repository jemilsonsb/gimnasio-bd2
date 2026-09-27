import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerTodosLosPagos() {
  return apiRequest('/pagos', {
    headers: headersAutenticados()
  });
}

export function obtenerPagosPorMembresia(idMembresia) {
  return apiRequest(`/pagos/membresia/${idMembresia}`, {
    headers: headersAutenticados()
  });
}

export function registrarPago(datos) {
  return apiRequest('/pagos', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}
