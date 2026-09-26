import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { crearToken } from '../src/utils/jwt.js';

test('POST /api/planes rechaza creación sin token', async () => {
  const respuesta = await request(app)
    .post('/api/planes')
    .send({ nombre_plan: 'Plan Test', duracion_dias: 30, precio: 50 });

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/planes rechaza creación para rol no administrador (ej. Cliente)', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .post('/api/planes')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ nombre_plan: 'Plan Test', duracion_dias: 30, precio: 50 });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('POST /api/membresias rechaza asignación sin token', async () => {
  const respuesta = await request(app)
    .post('/api/membresias')
    .send({ fk_cliente: 1, fk_plan: 1 });

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/membresias rechaza asignación para usuario con rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .post('/api/membresias')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ fk_cliente: 1, fk_plan: 1 });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/membresias/usuario/:id_usuario rechaza consulta sin token', async () => {
  const respuesta = await request(app).get('/api/membresias/usuario/2');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/membresias/usuario/:id_usuario bloquea a un Cliente consultar membresías de otro usuario', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente5@test.com'
  });

  // El usuario 5 intenta consultar el historial del usuario 8
  const respuesta = await request(app)
    .get('/api/membresias/usuario/8')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/membresias/cliente/:id_cliente rechaza consulta sin token', async () => {
  const respuesta = await request(app).get('/api/membresias/cliente/1');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/membresias/cliente/:id_cliente rechaza consulta directa para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .get('/api/membresias/cliente/1')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/clientes rechaza consulta sin token', async () => {
  const respuesta = await request(app).get('/api/clientes');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/clientes rechaza consulta para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .get('/api/clientes')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

