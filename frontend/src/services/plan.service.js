import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerPlanes(todos = false) {
  const query = todos ? '?todos=true' : '';
  return apiRequest(`/planes${query}`, {
    headers: headersAutenticados()
  });
}

export function obtenerPlanPorId(idPlan) {
  return apiRequest(`/planes/${idPlan}`, {
    headers: headersAutenticados()
  });
}

export function crearPlan(datos) {
  return apiRequest('/planes', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}

export function actualizarPlan(idPlan, datos) {
  return apiRequest(`/planes/${idPlan}`, {
    method: 'PUT',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}
