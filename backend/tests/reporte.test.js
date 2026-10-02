import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { crearToken } from '../src/utils/jwt.js';

const tokenCliente = crearToken({
  id_usuario: 1,
  id_rol: 3,
  nombre_rol: 'Cliente',
  correo: 'cliente@prueba.com'
});

const tokenEntrenador = crearToken({
  id_usuario: 2,
  id_rol: 2,
  nombre_rol: 'Entrenador',
  correo: 'entrenador@prueba.com'
});

const RUTAS_SOLO_ADMIN = ['/api/reportes/ingresos', '/api/reportes/membresias', '/api/reportes/clientes'];
const RUTAS_ADMIN_ENTRENADOR = ['/api/reportes/clases', '/api/reportes/rutinas'];

for (const ruta of RUTAS_SOLO_ADMIN) {
  test(`GET ${ruta} rechaza una solicitud sin token`, async () => {
    const respuesta = await request(app).get(ruta);

    assert.equal(respuesta.status, 401);
    assert.equal(respuesta.body.success, false);
    assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
  });

  test(`GET ${ruta} rechaza un token de rol Cliente`, async () => {
    const respuesta = await request(app)
      .get(ruta)
      .set('Authorization', `Bearer ${tokenCliente}`);

    assert.equal(respuesta.status, 403);
    assert.equal(respuesta.body.error.code, 'FORBIDDEN');
  });

  test(`GET ${ruta} rechaza un token de rol Entrenador`, async () => {
    const respuesta = await request(app)
      .get(ruta)
      .set('Authorization', `Bearer ${tokenEntrenador}`);

    assert.equal(respuesta.status, 403);
    assert.equal(respuesta.body.error.code, 'FORBIDDEN');
  });
}

for (const ruta of RUTAS_ADMIN_ENTRENADOR) {
  test(`GET ${ruta} rechaza una solicitud sin token`, async () => {
    const respuesta = await request(app).get(ruta);

    assert.equal(respuesta.status, 401);
    assert.equal(respuesta.body.success, false);
    assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
  });

  test(`GET ${ruta} rechaza un token de rol Cliente`, async () => {
    const respuesta = await request(app)
      .get(ruta)
      .set('Authorization', `Bearer ${tokenCliente}`);

    assert.equal(respuesta.status, 403);
    assert.equal(respuesta.body.error.code, 'FORBIDDEN');
  });
}
