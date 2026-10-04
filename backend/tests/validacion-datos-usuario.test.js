import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/config/database.js';
import { normalizarContacto, validarDatosContacto } from '../src/validations/autenticacion.validation.js';
import { crearToken } from '../src/utils/jwt.js';

const contactoValido = {
  documento_identidad: '1234567890',
  telefono: '3001234567',
  correo: 'liset@gmail.com'
};

const cuerpoRegistro = {
  nombre: 'Prueba',
  apellido: 'Apellido',
  contrasena: '123456',
  ...contactoValido
};

function crearConexionFalsa() {
  return {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql) => {
      if (sql.includes('FROM rol')) return [[{ id_rol: 3, nombre_rol: 'Cliente' }]];
      if (sql.includes('FROM estado')) return [[{ id_estado: 1 }]];
      if (sql.startsWith('INSERT INTO usuario')) return [{ insertId: 10 }];
      return [{}];
    }
  };
}

function errorDeCampo(errores, campo) {
  return errores.find((e) => e.field === campo);
}

test('documento: acepta entre 7 y 10 dígitos', () => {
  for (const documento of ['1234567', '1234567890']) {
    const errores = validarDatosContacto({ ...contactoValido, documento_identidad: documento });
    assert.equal(errorDeCampo(errores, 'documento_identidad'), undefined, documento);
  }
});

test('documento: rechaza longitud fuera de rango o caracteres no numéricos', () => {
  for (const documento of ['123456', '12345678901', '12345abc', '123 456 78', '']) {
    const errores = validarDatosContacto({ ...contactoValido, documento_identidad: documento });
    assert.ok(errorDeCampo(errores, 'documento_identidad'), documento);
  }
});

test('teléfono: vacío es válido porque es opcional', () => {
  assert.equal(errorDeCampo(validarDatosContacto({ ...contactoValido, telefono: '' }), 'telefono'), undefined);
});

test('teléfono: acepta 10 dígitos empezando por 3', () => {
  const errores = validarDatosContacto({ ...contactoValido, telefono: '3001234567' });
  assert.equal(errorDeCampo(errores, 'telefono'), undefined);
});

test('teléfono: rechaza longitud incorrecta, otro primer dígito, separadores, prefijo +57 y letras', () => {
  const invalidos = [
    '300123456',
    '30012345678',
    '2001234567',
    '300-123-4567',
    '300 123 4567',
    '+573001234567',
    'abcdefghij'
  ];
  for (const telefono of invalidos) {
    const errores = validarDatosContacto({ ...contactoValido, telefono });
    assert.ok(errorDeCampo(errores, 'telefono'), telefono);
  }
});

test('correo: acepta formatos con dominio que tiene punto', () => {
  for (const correo of ['liset@gmail.com', 'a.b@dominio.co']) {
    const errores = validarDatosContacto({ ...contactoValido, correo });
    assert.equal(errorDeCampo(errores, 'correo'), undefined, correo);
  }
});

test('correo: rechaza dominio sin punto y otros formatos inválidos', () => {
  const invalidos = ['liset@gmail', 'liset@', '@gmail.com', 'liset gmail@x.com', 'liset@gmail.'];
  for (const correo of invalidos) {
    const errores = validarDatosContacto({ ...contactoValido, correo });
    assert.ok(errorDeCampo(errores, 'correo'), correo);
  }
});

test('normalizarContacto convierte un teléfono numérico en texto sin lanzar error', () => {
  const contacto = normalizarContacto({ documento_identidad: 1234567, telefono: 3001234567, correo: ' Liset@Gmail.com ' });

  assert.equal(contacto.documento_identidad, '1234567');
  assert.equal(contacto.telefono, '3001234567');
  assert.equal(contacto.correo, 'liset@gmail.com');
});

test('POST /api/autenticacion/registro rechaza documento inválido con VALIDATION_ERROR y detalle por campo', async () => {
  const respuesta = await request(app)
    .post('/api/autenticacion/registro')
    .send({ ...cuerpoRegistro, documento_identidad: '12345abc' });

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.success, false);
  assert.equal(respuesta.body.error.code, 'VALIDATION_ERROR');
  assert.equal(respuesta.body.error.details.length, 1);
  assert.equal(respuesta.body.error.details[0].field, 'documento_identidad');
});

test('POST /api/autenticacion/registro rechaza correo sin dominio con punto', async () => {
  const respuesta = await request(app)
    .post('/api/autenticacion/registro')
    .send({ ...cuerpoRegistro, correo: 'liset@gmail' });

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.error.code, 'VALIDATION_ERROR');
  assert.equal(respuesta.body.error.details[0].field, 'correo');
});

test('POST /api/autenticacion/registro responde 400 y no 500 cuando el teléfono llega como número', async () => {
  const respuesta = await request(app)
    .post('/api/autenticacion/registro')
    .send({ ...cuerpoRegistro, telefono: 300123456 });

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.error.details[0].field, 'telefono');
});

test('POST /api/usuarios rechaza teléfono con prefijo +57 antes de tocar la base de datos', async () => {
  const token = crearToken({
    id_usuario: 1,
    id_rol: 1,
    nombre_rol: 'Administrador',
    correo: 'admin@prueba.com'
  });

  const respuesta = await request(app)
    .post('/api/usuarios')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Prueba',
      apellido: 'Apellido',
      contrasena: '123456',
      nombre_rol: 'Entrenador',
      ...contactoValido,
      telefono: '+573001234567'
    });

  assert.equal(respuesta.status, 400);
  assert.equal(respuesta.body.error.code, 'VALIDATION_ERROR');
  assert.equal(respuesta.body.error.details[0].field, 'telefono');
});

test('POST /api/autenticacion/registro acepta datos válidos sin teléfono', async (t) => {
  const conexion = crearConexionFalsa();
  t.mock.method(pool, 'getConnection', async () => conexion);

  const { telefono, ...sinTelefono } = cuerpoRegistro;
  const respuesta = await request(app).post('/api/autenticacion/registro').send(sinTelefono);

  assert.equal(respuesta.status, 201);
  assert.equal(respuesta.body.success, true);
});

after(async () => {
  await pool.end();
});
