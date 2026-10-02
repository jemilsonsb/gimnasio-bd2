import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { crearToken } from '../src/utils/jwt.js';
import {
  calcularIntentoFallido,
  estaBloqueado,
  minutosRestantes
} from '../src/utils/bloqueo-login.js';

const ahora = new Date('2026-01-01T00:00:00Z');

test('estaBloqueado es falso cuando no hay bloqueado_hasta', () => {
  assert.equal(estaBloqueado(null, ahora), false);
});

test('estaBloqueado es verdadero con un bloqueo vigente', () => {
  const bloqueadoHasta = new Date('2026-01-01T00:10:00Z');
  assert.equal(estaBloqueado(bloqueadoHasta, ahora), true);
});

test('estaBloqueado es falso con un bloqueo ya expirado', () => {
  const bloqueadoHasta = new Date('2025-12-31T23:50:00Z');
  assert.equal(estaBloqueado(bloqueadoHasta, ahora), false);
});

test('minutosRestantes redondea hacia arriba los minutos de un bloqueo vigente', () => {
  const bloqueadoHasta = new Date('2026-01-01T00:14:30Z');
  assert.equal(minutosRestantes(bloqueadoHasta, ahora), 15);
});

test('calcularIntentoFallido suma de a uno mientras no llega al máximo (0 a 4 intentos)', () => {
  for (let intentosFallidos = 0; intentosFallidos < 4; intentosFallidos += 1) {
    const resultado = calcularIntentoFallido({ intentosFallidos, bloqueadoHasta: null, ahora });
    assert.equal(resultado.intentosFallidos, intentosFallidos + 1);
    assert.equal(resultado.bloqueadoHasta, null);
  }
});

test('calcularIntentoFallido bloquea la cuenta al llegar al 5to intento', () => {
  const resultado = calcularIntentoFallido({ intentosFallidos: 4, bloqueadoHasta: null, ahora });

  assert.equal(resultado.intentosFallidos, 5);
  assert.ok(resultado.bloqueadoHasta instanceof Date);
  assert.equal(resultado.bloqueadoHasta.getTime(), ahora.getTime() + 15 * 60000);
});

test('calcularIntentoFallido reinicia el contador desde 0 si el bloqueo ya expiró', () => {
  const bloqueadoHasta = new Date('2025-12-31T23:00:00Z');
  const resultado = calcularIntentoFallido({ intentosFallidos: 5, bloqueadoHasta, ahora });

  assert.equal(resultado.intentosFallidos, 1);
  assert.equal(resultado.bloqueadoHasta, null);
});

test('calcularIntentoFallido no reinicia el contador si el bloqueo sigue vigente', () => {
  const bloqueadoHasta = new Date('2026-01-01T00:10:00Z');
  const resultado = calcularIntentoFallido({ intentosFallidos: 5, bloqueadoHasta, ahora });

  assert.equal(resultado.intentosFallidos, 6);
});

test('PATCH /api/usuarios/:id/desbloquear rechaza una solicitud sin token', async () => {
  const respuesta = await request(app).patch('/api/usuarios/1/desbloquear');

  assert.equal(respuesta.status, 401);
  assert.equal(respuesta.body.error.code, 'UNAUTHORIZED');
});

test('PATCH /api/usuarios/:id/desbloquear rechaza un token de rol Cliente', async () => {
  const token = crearToken({
    id_usuario: 1,
    id_rol: 3,
    nombre_rol: 'Cliente',
    correo: 'cliente@prueba.com'
  });

  const respuesta = await request(app)
    .patch('/api/usuarios/1/desbloquear')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});

test('PATCH /api/usuarios/:id/desbloquear rechaza un token de rol Entrenador', async () => {
  const token = crearToken({
    id_usuario: 2,
    id_rol: 2,
    nombre_rol: 'Entrenador',
    correo: 'entrenador@prueba.com'
  });

  const respuesta = await request(app)
    .patch('/api/usuarios/2/desbloquear')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(respuesta.status, 403);
  assert.equal(respuesta.body.error.code, 'FORBIDDEN');
});
