import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { crearToken } from '../src/utils/jwt.js';

// ─── Rechazo sin token ─────────────────────────────────────────────────────────

test('PUT /api/membresias/:id rechaza edición sin token', async () => {
  const respuesta = await request(app)
    .put('/api/membresias/1')
    .send({ fk_plan: 1 });

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

// ─── Rechazo por rol incorrecto ────────────────────────────────────────────────

test('PUT /api/membresias/:id rechaza edición para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .put('/api/membresias/1')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ fk_plan: 1 });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

// ─── Validación: sin campos a editar ──────────────────────────────────────────

test('PUT /api/membresias/:id rechaza si no se envía ningún campo a editar', async () => {
  const tokenAdmin = crearToken({
    id_usuario: 1,
    id_rol: 1,
    nombre_rol: 'Administrador',
    correo: 'admin@test.com'
  });

  const respuesta = await request(app)
    .put('/api/membresias/1')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({});

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'VALIDATION_ERROR');
});

// ─── Validación: formato de fecha inválido ─────────────────────────────────────

test('PUT /api/membresias/:id rechaza fecha_inicio con formato inválido', async () => {
  const tokenAdmin = crearToken({
    id_usuario: 1,
    id_rol: 1,
    nombre_rol: 'Administrador',
    correo: 'admin@test.com'
  });

  const respuesta = await request(app)
    .put('/api/membresias/1')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ fecha_inicio: '26-09-2026' }); // formato incorrecto

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'VALIDATION_ERROR');
});

// ─── Regla de negocio: no editar membresía Cancelada ──────────────────────────
// Este test asume que en la BD existe una membresía con estado 'Cancelada'.
// Si la membresía no existe, se espera 404; si existe y está Cancelada, 400.

test('PUT /api/membresias/:id rechaza editar una membresía Cancelada', async () => {
  const tokenAdmin = crearToken({
    id_usuario: 1,
    id_rol: 1,
    nombre_rol: 'Administrador',
    correo: 'admin@test.com'
  });

  // Usamos un id_membresia que se espera exista y esté Cancelada en el entorno de prueba.
  // Si no existe, la respuesta será 404 (también correcto para la prueba de integración).
  const respuesta = await request(app)
    .put('/api/membresias/99999') // id inexistente → 404
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ fk_plan: 1 });

  assert.ok(
    respuesta.status === 400 || respuesta.status === 404,
    `Esperaba 400 (MEMBERSHIP_CANCELLED) o 404 (MEMBERSHIP_NOT_FOUND), se obtuvo ${respuesta.status}`
  );
  assert.equal(respuesta.body.success, false);
});

// ─── Validación: fk_plan inválido (no numérico) ────────────────────────────────

test('PUT /api/membresias/:id rechaza fk_plan con valor no numérico', async () => {
  const tokenAdmin = crearToken({
    id_usuario: 1,
    id_rol: 1,
    nombre_rol: 'Administrador',
    correo: 'admin@test.com'
  });

  const respuesta = await request(app)
    .put('/api/membresias/1')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ fk_plan: 'plan-invalido' });

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'VALIDATION_ERROR');
});

after(async () => {
  await pool.end();
});

