import {
  buscarUsuarioPorCorreo,
  crearUsuarioConExtension,
  verificarContrasena
} from '../models/autenticacion.model.js';
import { crearToken } from '../utils/jwt.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

function usuarioPublico(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    documento_identidad: usuario.documento_identidad,
    correo: usuario.correo,
    telefono: usuario.telefono,
    estado: usuario.estado,
    id_rol: usuario.id_rol,
    nombre_rol: usuario.nombre_rol
  };
}

export async function registrar(req, res, next) {
  try {
    const usuario = await crearUsuarioConExtension({
      nombre: req.body.nombre.trim(),
      apellido: req.body.apellido.trim(),
      documentoIdentidad: req.body.documento_identidad.trim(),
      correo: req.body.correo.trim().toLowerCase(),
      contrasena: req.body.contrasena,
      telefono: req.body.telefono?.trim(),
      nombreRol: req.body.nombre_rol || 'Cliente',
      codigoMiembro: req.body.codigo_miembro?.trim()
    });

    return successResponse(res, 201, 'Usuario registrado correctamente', usuario);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 409, 'El documento o correo ya está registrado', 'DUPLICATE_USER');
    }
    if (error.code === 'ROLE_NOT_FOUND') {
      return errorResponse(res, 400, error.message, error.code);
    }
    return next(error);
  }
}

export async function iniciarSesion(req, res, next) {
  try {
    const correo = req.body.correo.trim().toLowerCase();
    const usuario = await buscarUsuarioPorCorreo(correo);

    if (!usuario || !(await verificarContrasena(req.body.contrasena, usuario.contrasena))) {
      return errorResponse(res, 401, 'Correo o contraseña incorrectos', 'INVALID_CREDENTIALS');
    }

    if (usuario.estado !== 'Activo') {
      return errorResponse(res, 403, 'El usuario está inactivo', 'INACTIVE_USER');
    }

    const token = crearToken({
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
      nombre_rol: usuario.nombre_rol,
      correo: usuario.correo
    });

    return successResponse(res, 200, 'Inicio de sesión correcto', {
      token,
      usuario: usuarioPublico(usuario)
    });
  } catch (error) {
    return next(error);
  }
}

export function obtenerSesion(req, res) {
  return successResponse(res, 200, 'Sesión válida', {
    usuario: req.usuarioAutenticado
  });
}
