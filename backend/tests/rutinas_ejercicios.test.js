import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { crearToken } from '../src/utils/jwt.js';

// ─── MÓDULO EJERCICIOS ──────────────────────────────────────────

test('GET /api/ejercicios rechaza consulta sin token', async () => {
  const respuesta = await request(app).get('/api/ejercicios');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/ejercicios rechaza creación sin token', async () => {
  const respuesta = await request(app)
    .post('/api/ejercicios')
    .send({ nombre_ejercicio: 'Press banca', grupo_muscular: 'Pecho' });

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/ejercicios rechaza creación para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .post('/api/ejercicios')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ nombre_ejercicio: 'Sentadilla', grupo_muscular: 'Piernas' });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

// ─── MÓDULO RUTINAS ─────────────────────────────────────────────

test('GET /api/rutinas rechaza consulta sin token', async () => {
  const respuesta = await request(app).get('/api/rutinas');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/rutinas rechaza consulta general para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .get('/api/rutinas')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('POST /api/rutinas rechaza creación para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .post('/api/rutinas')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ fk_cliente: 1, nombre_rutina: 'Rutina Hipertrofia' });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('POST /api/rutinas/:id/detalles rechaza agregar ejercicio para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .post('/api/rutinas/1/detalles')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ fk_ejercicio: 1, dia_semana: 'Lunes', series: 4, repeticiones: 12 });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/rutinas/cliente/:id_usuario rechaza a un Cliente intentar ver rutinas de otro usuario', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .get('/api/rutinas/cliente/999')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('POST /api/rutinas responde ENTRENADOR_PROFILE_NOT_FOUND si el entrenador autenticado no tiene fila en entrenador', async () => {
  const tokenEntrenadorSinPerfil = crearToken({
    id_usuario: 999999, // Usuario que no tiene fila en tabla entrenador
    id_rol: 2,
    nombre_rol: 'Entrenador',
    correo: 'entrenadorsinperfil@test.com'
  });

  const respuesta = await request(app)
    .post('/api/rutinas')
    .set('Authorization', `Bearer ${tokenEntrenadorSinPerfil}`)
    .send({ fk_cliente: 1, nombre_rutina: 'Rutina Fuerza' });

  assert.ok(
    respuesta.status === 404,
    `Esperaba 404 pero se obtuvo ${respuesta.status}`
  );
  assert.equal(respuesta.body.success, false);
  assert.ok(
    respuesta.body.error.code === 'ENTRENADOR_PROFILE_NOT_FOUND' ||
    respuesta.body.error.code === 'CLIENT_PROFILE_NOT_FOUND',
    `Código de error inesperado: ${respuesta.body.error.code}`
  );
});

// ─── MÓDULO FICHA TÉCNICA ───────────────────────────────────────

test('GET /api/ficha-tecnica/:id_usuario rechaza consulta sin token', async () => {
  const respuesta = await request(app).get('/api/ficha-tecnica/1');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/ficha-tecnica rechaza creación para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .post('/api/ficha-tecnica')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ fk_cliente: 1, peso_kg: 75.5, estatura: 1.75 });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/ficha-tecnica/:id_usuario rechaza a un Cliente ver ficha técnica de otro usuario', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .get('/api/ficha-tecnica/999')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('POST /api/ficha-tecnica responde CLIENT_PROFILE_NOT_FOUND si el cliente no existe', async () => {
  const tokenAdmin = crearToken({
    id_usuario: 1,
    id_rol: 1,
    nombre_rol: 'Administrador',
    correo: 'admin@test.com'
  });

  const respuesta = await request(app)
    .post('/api/ficha-tecnica')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ fk_cliente: 999999, peso_kg: 80.0, estatura: 1.80 });

  assert.equal(respuesta.status, 404);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'CLIENT_PROFILE_NOT_FOUND');
});

after(async () => {
  await pool.end();
});

