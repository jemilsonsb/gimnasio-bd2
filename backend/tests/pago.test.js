import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { crearToken } from '../src/utils/jwt.js';

test('POST /api/pagos rechaza registro sin token', async () => {
  const respuesta = await request(app)
    .post('/api/pagos')
    .send({ fk_membresia: 1, monto: 50, metodo_pago: 'Efectivo' });

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/pagos rechaza registro para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .post('/api/pagos')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send({ fk_membresia: 1, monto: 50, metodo_pago: 'Efectivo' });

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/pagos rechaza consulta sin token', async () => {
  const respuesta = await request(app).get('/api/pagos');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/pagos rechaza consulta general para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .get('/api/pagos')
    .set('Authorization', `Bearer ${tokenCliente}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('GET /api/pagos/membresia/:id rechaza consulta sin token', async () => {
  const respuesta = await request(app).get('/api/pagos/membresia/1');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/pagos/membresia/:id rechaza a Cliente acceder a membresía que no le pertenece', async () => {
  // Un usuario con rol Cliente que no es dueño de la membresía 1
  const tokenCliente = crearToken({
    id_usuario: 999999, // ID de usuario inexistente o no dueño
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'intruso@test.com'
  });

  const respuesta = await request(app)
    .get('/api/pagos/membresia/1')
    .set('Authorization', `Bearer ${tokenCliente}`);

  // Si la membresía existe en BD, responde 403; si no existe, 404
  assert.ok(
    respuesta.status === 403 || respuesta.status === 404,
    `Esperaba 403 o 404 pero se obtuvo ${respuesta.status}`
  );
  assert.equal(respuesta.body.success, false);
});

after(async () => {
  await pool.end();
});

