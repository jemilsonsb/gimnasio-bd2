import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

export async function buscarRolPorNombre(nombreRol, connection = pool) {
  const [filas] = await connection.execute(
    'SELECT id_rol, nombre_rol FROM rol WHERE nombre_rol = ?',
    [nombreRol]
  );
  return filas[0] || null;
}

export async function buscarUsuarioPorCorreo(correo) {
  const [filas] = await pool.execute(
    `SELECT u.id_usuario, u.nombre, u.apellido, u.documento_identidad,
            u.correo, u.contrasena, u.telefono, u.estado,
            r.id_rol, r.nombre_rol
       FROM usuario u
       INNER JOIN rol r ON r.id_rol = u.fk_rol
      WHERE u.correo = ?
      LIMIT 1`,
    [correo]
  );
  return filas[0] || null;
}

export async function crearUsuarioConExtension(datos) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const rol = await buscarRolPorNombre(datos.nombreRol, connection);
    if (!rol) {
      const error = new Error('El rol indicado no existe');
      error.code = 'ROLE_NOT_FOUND';
      throw error;
    }

    const contrasenaHash = await bcrypt.hash(datos.contrasena, 12);
    const [resultadoUsuario] = await connection.execute(
      `INSERT INTO usuario
        (nombre, apellido, documento_identidad, correo, contrasena, telefono, fecha_registro, fk_rol)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        datos.nombre,
        datos.apellido,
        datos.documentoIdentidad,
        datos.correo,
        contrasenaHash,
        datos.telefono || null,
        rol.id_rol
      ]
    );

    const idUsuario = resultadoUsuario.insertId;
    const tablasExtension = {
      Administrador: ['administrador', 'fk_usuario'],
      Entrenador: ['entrenador', 'fk_usuario'],
      Cliente: ['cliente', 'fk_usuario']
    };
    const tablaExtension = tablasExtension[rol.nombre_rol]?.[0];

    if (!tablaExtension) {
      const error = new Error('El rol no tiene una extensión configurada');
      error.code = 'ROLE_EXTENSION_NOT_FOUND';
      throw error;
    }

    const columnasCliente = rol.nombre_rol === 'Cliente' ? ', codigo_miembro' : '';
    const valoresCliente = rol.nombre_rol === 'Cliente' ? ', ?' : '';
    const parametros = rol.nombre_rol === 'Cliente'
      ? [idUsuario, datos.codigoMiembro || `CLI-${idUsuario}`]
      : [idUsuario];

    await connection.execute(
      `INSERT INTO ${tablaExtension} (fk_usuario${columnasCliente}) VALUES (?${valoresCliente})`,
      parametros
    );

    await connection.commit();

    return {
      id_usuario: idUsuario,
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      nombre_rol: rol.nombre_rol
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function verificarContrasena(contrasena, hash) {
  return bcrypt.compare(contrasena, hash);
}
