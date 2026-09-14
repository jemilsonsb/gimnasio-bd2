import { apiRequest } from './api.js';

export function iniciarSesion(datos) {
  return apiRequest('/autenticacion/login', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

export function registrarUsuario(datos) {
  return apiRequest('/autenticacion/registro', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}
