import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { MAX_INTENTOS_FALLIDOS, MINUTOS_BLOQUEO } from '../utils/bloqueo-login.js';

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
            u.correo, u.contrasena, u.telefono,
            u.intentos_fallidos, u.bloqueado_hasta, NOW() AS ahora_bd,
            e.id_estado, e.nombre_estado AS estado,
            r.id_rol, r.nombre_rol
       FROM usuario u
       INNER JOIN rol r ON r.id_rol = u.fk_rol
       INNER JOIN estado e ON e.id_estado = u.fk_estado
      WHERE u.correo = ?
      LIMIT 1`,
    [correo]
  );
  return filas[0] || null;
}

export async function obtenerEstadoBloqueo(idUsuario) {
  const [filas] = await pool.execute(
    'SELECT bloqueado_hasta, NOW() AS ahora_bd FROM usuario WHERE id_usuario = ? LIMIT 1',
    [idUsuario]
  );
  return filas[0] || null;
}

export async function registrarIntentoFallido(idUsuario) {
  await pool.execute(
    `UPDATE usuario
        SET intentos_fallidos = IF(bloqueado_hasta IS NOT NULL AND bloqueado_hasta <= NOW(), 1, intentos_fallidos + 1),
            bloqueado_hasta = IF(intentos_fallidos >= ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), NULL)
      WHERE id_usuario = ?`,
    [MAX_INTENTOS_FALLIDOS, MINUTOS_BLOQUEO, idUsuario]
  );
}

export async function reiniciarIntentosFallidos(idUsuario) {
  await pool.execute(
    'UPDATE usuario SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = ?',
    [idUsuario]
  );
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

    const [estadosActivos] = await connection.execute(
      "SELECT id_estado FROM estado WHERE nombre_estado = 'Activo' LIMIT 1"
    );
    if (!estadosActivos[0]) {
      const error = new Error("No está configurado el estado 'Activo'");
      error.code = 'ACTIVE_STATUS_NOT_FOUND';
      throw error;
    }

    let idNivelAccesoTotal = null;
    if (rol.nombre_rol === 'Administrador') {
      const [nivelesTotal] = await connection.execute(
        "SELECT id_nivel_acceso FROM nivel_acceso WHERE nombre_nivel_acceso = 'Total' LIMIT 1"
      );
      if (!nivelesTotal[0]) {
        const error = new Error("No está configurado el nivel de acceso 'Total'");
        error.code = 'NIVEL_ACCESO_NOT_FOUND';
        throw error;
      }
      idNivelAccesoTotal = nivelesTotal[0].id_nivel_acceso;
    }

    const contrasenaHash = await bcrypt.hash(datos.contrasena, 12);
    const [resultadoUsuario] = await connection.execute(
      `INSERT INTO usuario
          (nombre, apellido, documento_identidad, correo, contrasena, telefono, fecha_registro, fk_rol, fk_estado)
               VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        datos.nombre,
        datos.apellido,
        datos.documentoIdentidad,
        datos.correo,
        contrasenaHash,
        datos.telefono || null,
        rol.id_rol,
        estadosActivos[0].id_estado
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

    const columnasExtension = ['fk_usuario'];
    const parametros = [idUsuario];
    if (rol.nombre_rol === 'Cliente') {
      columnasExtension.push('codigo_miembro');
      parametros.push(datos.codigoMiembro || `CLI-${idUsuario}`);
    }
    if (rol.nombre_rol === 'Administrador') {
      columnasExtension.push('fk_nivel_acceso');
      parametros.push(idNivelAccesoTotal);
    }

    await connection.execute(
      `INSERT INTO ${tablaExtension} (${columnasExtension.join(', ')}) VALUES (${columnasExtension.map(() => '?').join(', ')})`,
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
