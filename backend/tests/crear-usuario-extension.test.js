import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { pool } from '../src/config/database.js';
import { crearUsuarioConExtension } from '../src/models/autenticacion.model.js';

const datosBase = {
  nombre: 'Prueba',
  apellido: 'Apellido',
  documentoIdentidad: '00000000',
  correo: 'prueba.extension@correo.com',
  contrasena: '123456'
};

function crearConexionFalsa(nombreRol, { hayNivelTotal = true } = {}) {
  const consultas = [];
  const conexion = {
    consultas,
    beginTransaction: async () => consultas.push({ sql: 'BEGIN' }),
    commit: async () => consultas.push({ sql: 'COMMIT' }),
    rollback: async () => consultas.push({ sql: 'ROLLBACK' }),
    release: () => consultas.push({ sql: 'RELEASE' }),
    execute: async (sql, params = []) => {
      consultas.push({ sql, params });
      if (sql.includes('FROM rol')) return [[{ id_rol: 1, nombre_rol: nombreRol }]];
      if (sql.includes('FROM estado')) return [[{ id_estado: 1 }]];
      if (sql.includes('FROM nivel_acceso')) {
        return [hayNivelTotal ? [{ id_nivel_acceso: 1 }] : []];
      }
      if (sql.startsWith('INSERT INTO usuario')) return [{ insertId: 10 }];
      return [{}];
    }
  };
  return conexion;
}

function consultaInsertExtension(conexion, tabla) {
  return conexion.consultas.find((c) => c.sql.startsWith(`INSERT INTO ${tabla} `));
}

test('crear Administrador inserta fk_nivel_acceso con el id de Total en la misma transacción', async (t) => {
  const conexion = crearConexionFalsa('Administrador');
  t.mock.method(pool, 'getConnection', async () => conexion);

  const usuario = await crearUsuarioConExtension({ ...datosBase, nombreRol: 'Administrador' });

  const insert = consultaInsertExtension(conexion, 'administrador');
  assert.equal(insert.sql, 'INSERT INTO administrador (fk_usuario, fk_nivel_acceso) VALUES (?, ?)');
  assert.deepEqual(insert.params, [10, 1]);
  assert.equal(usuario.nombre_rol, 'Administrador');
  assert.ok(conexion.consultas.some((c) => c.sql === 'COMMIT'));
  assert.ok(!conexion.consultas.some((c) => c.sql === 'ROLLBACK'));
});

test('crear Administrador sin nivel Total falla con NIVEL_ACCESO_NOT_FOUND y hace rollback', async (t) => {
  const conexion = crearConexionFalsa('Administrador', { hayNivelTotal: false });
  t.mock.method(pool, 'getConnection', async () => conexion);

  await assert.rejects(
    () => crearUsuarioConExtension({ ...datosBase, nombreRol: 'Administrador' }),
    (error) => error.code === 'NIVEL_ACCESO_NOT_FOUND'
  );

  assert.ok(conexion.consultas.some((c) => c.sql === 'ROLLBACK'));
  assert.ok(!conexion.consultas.some((c) => c.sql === 'COMMIT'));
  assert.equal(consultaInsertExtension(conexion, 'administrador'), undefined);
  assert.ok(conexion.consultas.some((c) => c.sql === 'RELEASE'));
});

test('crear Entrenador no consulta nivel_acceso ni cambia su INSERT', async (t) => {
  const conexion = crearConexionFalsa('Entrenador');
  t.mock.method(pool, 'getConnection', async () => conexion);

  await crearUsuarioConExtension({ ...datosBase, nombreRol: 'Entrenador' });

  const insert = consultaInsertExtension(conexion, 'entrenador');
  assert.equal(insert.sql, 'INSERT INTO entrenador (fk_usuario) VALUES (?)');
  assert.deepEqual(insert.params, [10]);
  assert.ok(!conexion.consultas.some((c) => c.sql.includes('nivel_acceso')));
});

test('crear Cliente no consulta nivel_acceso y conserva codigo_miembro', async (t) => {
  const conexion = crearConexionFalsa('Cliente');
  t.mock.method(pool, 'getConnection', async () => conexion);

  await crearUsuarioConExtension({ ...datosBase, nombreRol: 'Cliente', codigoMiembro: 'CLI-PRUEBA' });

  const insert = consultaInsertExtension(conexion, 'cliente');
  assert.equal(insert.sql, 'INSERT INTO cliente (fk_usuario, codigo_miembro) VALUES (?, ?)');
  assert.deepEqual(insert.params, [10, 'CLI-PRUEBA']);
  assert.ok(!conexion.consultas.some((c) => c.sql.includes('nivel_acceso')));
});

after(async () => {
  await pool.end();
});
