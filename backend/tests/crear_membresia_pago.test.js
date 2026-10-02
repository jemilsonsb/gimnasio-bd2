import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { crearToken } from '../src/utils/jwt.js';

const CUERPO_VALIDO = {
  fk_cliente: 1,
  fk_plan: 1,
  pago: { metodo_pago: 'Efectivo', estado_pago: 'Pagado' }
};

test('POST /api/membresias con pago rechaza registro sin token', async () => {
  const respuesta = await request(app).post('/api/membresias').send(CUERPO_VALIDO);

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/membresias con pago rechaza registro para rol Cliente', async () => {
  const tokenCliente = crearToken({
    id_usuario: 5,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@test.com'
  });

  const respuesta = await request(app)
    .post('/api/membresias')
    .set('Authorization', `Bearer ${tokenCliente}`)
    .send(CUERPO_VALIDO);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('POST /api/membresias con pago rechaza registro para rol Entrenador', async () => {
  const tokenEntrenador = crearToken({
    id_usuario: 10,
    id_rol: 2,
    nombre_rol: 'Entrenador',
    correo: 'entrenador@test.com'
  });

  const respuesta = await request(app)
    .post('/api/membresias')
    .set('Authorization', `Bearer ${tokenEntrenador}`)
    .send(CUERPO_VALIDO);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

after(async () => {
  await pool.end();
});
