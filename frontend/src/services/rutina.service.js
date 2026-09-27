import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

export function obtenerTodasRutinas() {
  return apiRequest('/rutinas', {
    headers: headersAutenticados()
  });
}

export function obtenerRutinasPorCliente(idUsuario) {
  return apiRequest(`/rutinas/cliente/${idUsuario}`, {
    headers: headersAutenticados()
  });
}

export function crearRutina(datos) {
  return apiRequest('/rutinas', {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}

export function obtenerDetallesRutina(idRutina) {
  return apiRequest(`/rutinas/${idRutina}/detalles`, {
    headers: headersAutenticados()
  });
}

export function agregarDetalleRutina(idRutina, datos) {
  return apiRequest(`/rutinas/${idRutina}/detalles`, {
    method: 'POST',
    headers: headersAutenticados(),
    body: JSON.stringify(datos)
  });
}
