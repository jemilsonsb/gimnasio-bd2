import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { usuarioPublico } from '../src/controllers/autenticacion.controller.js';
import { crearToken } from '../src/utils/jwt.js';

test('GET /api/health responde con el formato de éxito', async () => {
  const respuesta = await request(app).get('/api/health');

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.success, true);
  assert.equal(respuesta.body.data.status, 'ok');
});

test('GET /api/autenticacion/sesion rechaza una solicitud sin token', async () => {
  const respuesta = await request(app).get('/api/autenticacion/sesion');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/autenticacion/sesion acepta un JWT válido', async () => {
  const token = crearToken({
    id_usuario: 1,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@prueba.com'
  });
  const respuesta = await request(app)
    .get('/api/autenticacion/sesion')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.data.usuario.nombre_rol, 'Cliente');
});

test('GET /api/autenticacion/sesion/cliente valida el rol del JWT', async () => {
  const token = crearToken({
    id_usuario: 1,
    id_rol: 1,
    nombre_rol: 'Administrador',
    correo: 'admin@prueba.com'
  });
  const respuesta = await request(app)
    .get('/api/autenticacion/sesion/cliente')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('usuarioPublico expone el estado del catálogo como texto', () => {
  const usuario = {
    id_usuario: 7,
    nombre: 'Ana',
    apellido: 'García',
    documento_identidad: '12345678',
    correo: 'ana@correo.com',
    telefono: '999999999',
    id_estado: 1,
    nombre_estado: 'Activo',
    id_rol: 2,
    nombre_rol: 'Cliente'
  };

  const serializado = usuarioPublico(usuario);

  assert.equal(serializado.estado, 'Activo');
  assert.equal(serializado.id_estado, 1);
  assert.equal(serializado.nombre_rol, 'Cliente');
});
