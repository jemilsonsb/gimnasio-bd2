import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { crearToken } from '../src/utils/jwt.js';

const datosUsuarioNuevo = {
  nombre: 'Prueba',
  apellido: 'Apellido',
  documento_identidad: '00000000',
  correo: 'prueba.usuario@correo.com',
  contrasena: '123456',
  nombre_rol: 'Entrenador'
};

test('POST /api/usuarios rechaza una solicitud sin token', async () => {
  const respuesta = await request(app)
    .post('/api/usuarios')
    .send(datosUsuarioNuevo);

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/usuarios rechaza un token de rol Cliente', async () => {
  const token = crearToken({
    id_usuario: 1,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@prueba.com'
  });

  const respuesta = await request(app)
    .post('/api/usuarios')
    .set('Authorization', `Bearer ${token}`)
    .send(datosUsuarioNuevo);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('POST /api/usuarios rechaza un token de rol Entrenador', async () => {
  const token = crearToken({
    id_usuario: 2,
    id_rol: 2,
    nombre_rol: 'Entrenador',
    correo: 'entrenador@prueba.com'
  });

  const respuesta = await request(app)
    .post('/api/usuarios')
    .set('Authorization', `Bearer ${token}`)
    .send(datosUsuarioNuevo);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});
