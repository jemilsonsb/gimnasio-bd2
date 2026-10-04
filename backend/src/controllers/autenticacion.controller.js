import {
  buscarUsuarioPorCorreo,
  crearUsuarioConExtension,
  obtenerEstadoBloqueo,
  registrarIntentoFallido,
  reiniciarIntentosFallidos,
  verificarContrasena
} from '../models/autenticacion.model.js';
import { crearToken } from '../utils/jwt.js';
import { errorResponse, successResponse } from '../utils/api-response.js';
import { estaBloqueado, minutosRestantes } from '../utils/bloqueo-login.js';
import { normalizarContacto, validarDatosContacto } from '../validations/autenticacion.validation.js';

function respuestaCuentaBloqueada(res, bloqueadoHasta, ahora) {
  const minutos = minutosRestantes(bloqueadoHasta, ahora);
  return errorResponse(
    res,
    429,
    `Cuenta bloqueada temporalmente por intentos fallidos. Intenta de nuevo en ${minutos} minuto(s).`,
    'ACCOUNT_LOCKED'
  );
}

export function usuarioPublico(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    documento_identidad: usuario.documento_identidad,
    correo: usuario.correo,
    telefono: usuario.telefono,
    id_estado: usuario.id_estado ?? null,
    estado: usuario.estado ?? usuario.nombre_estado ?? null,
    id_rol: usuario.id_rol,
    nombre_rol: usuario.nombre_rol
  };
}

export async function registrar(req, res, next) {
  try {
    const contacto = normalizarContacto(req.body);
    const errores = validarDatosContacto(contacto);
    if (errores.length > 0) {
      return errorResponse(res, 400, 'Datos inválidos', 'VALIDATION_ERROR', errores);
    }

    const usuario = await crearUsuarioConExtension({
      nombre: req.body.nombre.trim(),
      apellido: req.body.apellido.trim(),
      documentoIdentidad: contacto.documento_identidad,
      correo: contacto.correo,
      contrasena: req.body.contrasena,
      telefono: contacto.telefono,
      nombreRol: 'Cliente',
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

    if (!usuario) {
      return errorResponse(res, 401, 'Correo o contraseña incorrectos', 'INVALID_CREDENTIALS');
    }

    if (estaBloqueado(usuario.bloqueado_hasta, usuario.ahora_bd)) {
      return respuestaCuentaBloqueada(res, usuario.bloqueado_hasta, usuario.ahora_bd);
    }

    if (!(await verificarContrasena(req.body.contrasena, usuario.contrasena))) {
      await registrarIntentoFallido(usuario.id_usuario);

      const estadoBloqueo = await obtenerEstadoBloqueo(usuario.id_usuario);
      if (estaBloqueado(estadoBloqueo.bloqueado_hasta, estadoBloqueo.ahora_bd)) {
        return respuestaCuentaBloqueada(res, estadoBloqueo.bloqueado_hasta, estadoBloqueo.ahora_bd);
      }

      return errorResponse(res, 401, 'Correo o contraseña incorrectos', 'INVALID_CREDENTIALS');
    }

    await reiniciarIntentosFallidos(usuario.id_usuario);

    if ((usuario.estado ?? usuario.nombre_estado) !== 'Activo') {
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
