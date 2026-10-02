import { apiRequest } from './api.js';

function headersAutenticados() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json'
  };
}

function construirQuery(filtros = {}) {
  const parametros = Object.entries(filtros).filter(
    ([, valor]) => valor !== undefined && valor !== null && valor !== ''
  );

  if (parametros.length === 0) return '';

  const query = new URLSearchParams(parametros);
  return `?${query.toString()}`;
}

export function obtenerReporteIngresos(filtros) {
  return apiRequest(`/reportes/ingresos${construirQuery(filtros)}`, {
    headers: headersAutenticados()
  });
}

export function obtenerReporteMembresias(filtros) {
  return apiRequest(`/reportes/membresias${construirQuery(filtros)}`, {
    headers: headersAutenticados()
  });
}

export function obtenerReporteClases(filtros) {
  return apiRequest(`/reportes/clases${construirQuery(filtros)}`, {
    headers: headersAutenticados()
  });
}

export function obtenerReporteClientes(filtros) {
  return apiRequest(`/reportes/clientes${construirQuery(filtros)}`, {
    headers: headersAutenticados()
  });
}

export function obtenerReporteRutinas(filtros) {
  return apiRequest(`/reportes/rutinas${construirQuery(filtros)}`, {
    headers: headersAutenticados()
  });
}
