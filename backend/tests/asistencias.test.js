import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { crearToken } from '../src/utils/jwt.js';

const tokenAdmin = crearToken({
  id_usuario: 1,
  id_rol: 1,
  nombre_rol: 'Administrador',
  correo: 'admin@test.com'
});

const tokenCliente = crearToken({
  id_usuario: 5,
  id_rol: 3,
  nombre_rol: 'Cliente',
  correo: 'cliente@test.com'
});

// ─── POST /api/asistencias ──────────────────────────────────────────────────

test('POST /api/asistencias rechaza el registro sin token', async () => {
  const respuesta = await request(app)
    .post('/api/asistencias')
    .send({ fk_cliente: 1 });

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/asistencias rechaza el registro para rol Cliente', async () => {
  const respuesta = await request(app)
    .post('/api/asistencias')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ fk_cliente: 1 });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('POST /api/asistencias exige el campo fk_cliente', async () => {
  const respuesta = await request(app)
    .post('/api/asistencias')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({});

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'VALIDATION_ERROR');
});

// ─── GET /api/asistencias/mis-asistencias ───────────────────────────────────

test('GET /api/asistencias/mis-asistencias rechaza la consulta sin token', async () => {
  const respuesta = await request(app).get('/api/asistencias/mis-asistencias');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/asistencias/mis-asistencias rechaza la consulta para rol Administrador', async () => {
  const respuesta = await request(app)
    .get('/api/asistencias/mis-asistencias')
    .set('Authorization', `Bearer ${tokenAdmin}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/asistencias/mis-asistencias rechaza un formato de mes inválido', async () => {
  const respuesta = await request(app)
    .get('/api/asistencias/mis-asistencias?mes=2026-13-01')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'VALIDATION_ERROR');
});

// ─── GET /api/asistencias/cliente/:id_cliente ───────────────────────────────

test('GET /api/asistencias/cliente/:id_cliente rechaza la consulta sin token', async () => {
  const respuesta = await request(app).get('/api/asistencias/cliente/1');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/asistencias/cliente/:id_cliente rechaza la consulta para rol Cliente', async () => {
  const respuesta = await request(app)
    .get('/api/asistencias/cliente/1')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/asistencias/cliente/:id_cliente rechaza un ID inválido', async () => {
  const respuesta = await request(app)
    .get('/api/asistencias/cliente/abc')
    .set('Authorization', `Bearer ${tokenAdmin}`);

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'INVALID_ID');
});

after(async () => {
  await pool.end();
});
