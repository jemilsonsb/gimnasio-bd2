import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';

test('GET /api/dashboard rechaza una solicitud sin token', async () => {
  const respuesta = await request(app).get('/api/dashboard');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/dashboard rechaza un token inválido', async () => {
  const respuesta = await request(app)
    .get('/api/dashboard')
    .set('Authorization', 'Bearer token-invalido');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'INVALID_TOKEN');
});

test('GET /api/dashboard rechaza una solicitud sin esquema Bearer', async () => {
  const respuesta = await request(app)
    .get('/api/dashboard')
    .set('Authorization', 'token-sin-bearer');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

after(async () => {
  await pool.end();
});
