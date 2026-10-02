import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerDashboard() {
  return apiRequest('/dashboard', {
    headers: headersAutenticados()
  });
}
