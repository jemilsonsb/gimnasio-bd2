import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { crearToken } from '../src/utils/jwt.js';

// ─── Tokens reutilizables ────────────────────────────────────────

const tokenAdmin = crearToken({
  id_usuario: 1,
  id_rol: 1,
  nombre_rol: 'Administrador',
  correo: 'admin@test.com'
});

const tokenEntrenador = crearToken({
  id_usuario: 2,
  id_rol: 2,
  nombre_rol: 'Entrenador',
  correo: 'entrenador@test.com'
});

const tokenCliente = crearToken({
  id_usuario: 5,
  id_rol: 3,
  nombre_rol: 'Cliente',
  correo: 'cliente@test.com'
});

// ─── MÓDULO CLASES ───────────────────────────────────────────────

test('GET /api/clases rechaza consulta sin token', async () => {
  const r = await request(app).get('/api/clases');
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/clases acepta cualquier rol autenticado', async () => {
  const r = await request(app)
    .get('/api/clases')
    .set('Authorization', `Bearer ${tokenCliente}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.success, true);
  assert.ok(Array.isArray(r.body.data));
});

// ─── MÓDULO ENTRENADORES ──────────────────────────────────────────

test('GET /api/entrenadores rechaza consulta sin token', async () => {
  const r = await request(app).get('/api/entrenadores');
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/entrenadores acepta rol Administrador o Entrenador', async () => {
  const r = await request(app)
    .get('/api/entrenadores')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.success, true);
  assert.ok(Array.isArray(r.body.data));
});

test('POST /api/clases rechaza creacion sin token', async () => {
  const r = await request(app)
    .post('/api/clases')
    .send({ nombre_clase: 'Yoga', capacidad_maxima: 20 });
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/clases rechaza creacion para rol Cliente', async () => {
  const r = await request(app)
    .post('/api/clases')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ nombre_clase: 'Yoga', capacidad_maxima: 20 });
  assert.equal(r.status, 403);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'FORBIDDEN');
});

test('POST /api/clases rechaza capacidad_maxima invalida', async () => {
  const r = await request(app)
    .post('/api/clases')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ nombre_clase: 'Pilates', capacidad_maxima: -5 });
  assert.equal(r.status, 400);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'VALIDATION_ERROR');
});

// ─── MÓDULO PROGRAMACIONES ───────────────────────────────────────

test('GET /api/programaciones rechaza consulta sin token', async () => {
  const r = await request(app).get('/api/programaciones');
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/programaciones acepta cualquier rol autenticado', async () => {
  const r = await request(app)
    .get('/api/programaciones')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.success, true);
  assert.ok(Array.isArray(r.body.data));
});

test('POST /api/programaciones rechaza creacion sin token', async () => {
  const r = await request(app)
    .post('/api/programaciones')
    .send({ fk_clase: 1, fecha: '2027-01-15', hora_inicio: '08:00', hora_fin: '09:00', cupos_disponibles: 10 });
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/programaciones rechaza creacion para rol Cliente', async () => {
  const r = await request(app)
    .post('/api/programaciones')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ fk_clase: 1, fecha: '2027-01-15', hora_inicio: '08:00', hora_fin: '09:00', cupos_disponibles: 10 });
  assert.equal(r.status, 403);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'FORBIDDEN');
});

test('POST /api/programaciones rechaza fecha con formato invalido', async () => {
  const r = await request(app)
    .post('/api/programaciones')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ fk_clase: 1, fecha: '15-01-2027', hora_inicio: '08:00', hora_fin: '09:00', cupos_disponibles: 10, fk_entrenador: 1 });
  assert.equal(r.status, 400);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'VALIDATION_ERROR');
});

test('POST /api/programaciones rechaza hora_fin anterior a hora_inicio', async () => {
  const r = await request(app)
    .post('/api/programaciones')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ fk_clase: 1, fecha: '2027-01-15', hora_inicio: '10:00', hora_fin: '09:00', cupos_disponibles: 10, fk_entrenador: 1 });
  assert.equal(r.status, 400);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'VALIDATION_ERROR');
});

test('POST /api/programaciones responde 404 si el entrenador no tiene perfil o la clase no existe', async () => {
  // El token tiene rol Entrenador pero id_usuario=999999 no tiene fila en la tabla entrenador.
  // Si fk_clase tampoco existe en la BD de test, el controlador responde CLASE_NOT_FOUND primero.
  // Ambos codigos indican que el request fue rechazado correctamente con 404.
  const tokenSinPerfil = crearToken({
    id_usuario: 999999,
    id_rol: 2,
    nombre_rol: 'Entrenador',
    correo: 'sinperfil@test.com'
  });
  const r = await request(app)
    .post('/api/programaciones')
    .set('Authorization', `Bearer ${tokenSinPerfil}`)
    .send({ fk_clase: 1, fecha: '2027-06-01', hora_inicio: '08:00', hora_fin: '09:00', cupos_disponibles: 5 });
  assert.equal(r.status, 404);
  assert.equal(r.body.success, false);
  assert.ok(
    r.body.error.code === 'ENTRENADOR_PROFILE_NOT_FOUND' ||
    r.body.error.code === 'CLASE_NOT_FOUND',
    `Codigo inesperado: ${r.body.error.code}`
  );
});

test('GET /api/programaciones/:id/reservas rechaza sin token', async () => {
  const r = await request(app).get('/api/programaciones/1/reservas');
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/programaciones/:id/reservas rechaza para rol Cliente', async () => {
  const r = await request(app)
    .get('/api/programaciones/1/reservas')
    .set('Authorization', `Bearer ${tokenCliente}`);
  assert.equal(r.status, 403);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'FORBIDDEN');
});

// ─── MÓDULO RESERVAS ─────────────────────────────────────────────

test('POST /api/reservas rechaza sin token', async () => {
  const r = await request(app).post('/api/reservas').send({ fk_programacion: 1 });
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/reservas rechaza para rol Administrador', async () => {
  const r = await request(app)
    .post('/api/reservas')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ fk_programacion: 1 });
  assert.equal(r.status, 403);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'FORBIDDEN');
});

test('POST /api/reservas rechaza para rol Entrenador', async () => {
  const r = await request(app)
    .post('/api/reservas')
    .set('Authorization', `Bearer ${tokenEntrenador}`)
    .send({ fk_programacion: 1 });
  assert.equal(r.status, 403);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'FORBIDDEN');
});

test('POST /api/reservas responde CLIENT_PROFILE_NOT_FOUND si el cliente no tiene perfil', async () => {
  const tokenSinPerfil = crearToken({
    id_usuario: 999999,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'sinperfil@test.com'
  });
  const r = await request(app)
    .post('/api/reservas')
    .set('Authorization', `Bearer ${tokenSinPerfil}`)
    .send({ fk_programacion: 1 });
  assert.equal(r.status, 404);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'CLIENT_PROFILE_NOT_FOUND');
});

test('GET /api/reservas/mis-reservas rechaza sin token', async () => {
  const r = await request(app).get('/api/reservas/mis-reservas');
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/reservas/mis-reservas rechaza para rol Administrador', async () => {
  const r = await request(app)
    .get('/api/reservas/mis-reservas')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.equal(r.status, 403);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'FORBIDDEN');
});

test('PATCH /api/reservas/:id/cancelar rechaza sin token', async () => {
  const r = await request(app).patch('/api/reservas/1/cancelar');
  assert.equal(r.status, 401);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'UNAUTHORIZED');
});

test('PATCH /api/reservas/:id/cancelar rechaza para rol Entrenador', async () => {
  const r = await request(app)
    .patch('/api/reservas/1/cancelar')
    .set('Authorization', `Bearer ${tokenEntrenador}`);
  assert.equal(r.status, 403);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'FORBIDDEN');
});

test('PATCH /api/reservas/999999/cancelar responde 404 RESERVA_NOT_FOUND para Administrador con reserva inexistente', async () => {
  const r = await request(app)
    .patch('/api/reservas/999999/cancelar')
    .set('Authorization', `Bearer ${tokenAdmin}`);
  assert.equal(r.status, 404);
  assert.equal(r.body.success, false);
  assert.equal(r.body.error.code, 'RESERVA_NOT_FOUND');
});

test('PATCH /api/reservas/999999/cancelar responde 404 o 403 para Cliente con reserva inexistente', async () => {
  // 404 si la reserva no existe (y llega a buscarla); 403 si el cliente no tiene perfil
  const r = await request(app)
    .patch('/api/reservas/999999/cancelar')
    .set('Authorization', `Bearer ${tokenCliente}`);
  assert.ok(
    r.status === 404 || r.status === 403,
    `Esperaba 404 o 403 pero se obtuvo ${r.status}: ${JSON.stringify(r.body)}`
  );
  assert.equal(r.body.success, false);
});

after(async () => {
  await pool.end();
});
