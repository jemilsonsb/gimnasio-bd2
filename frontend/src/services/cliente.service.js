import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerClientes(todos = false) {
  const query = todos ? '?todos=true' : '';
  return apiRequest(`/clientes${query}`, {
    headers: headersAutenticados()
  });
}
