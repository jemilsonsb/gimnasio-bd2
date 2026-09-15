import {
	cambiarEstadoUsuario,
	listarUsuarios
} from '../models/usuario.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export async function obtenerUsuarios(_req, res, next) {
	try {
		const usuarios = await listarUsuarios();
		return successResponse(res, 200, 'Usuarios obtenidos correctamente', usuarios);
	} catch (error) {
		return next(error);
	}
}

export async function actualizarEstadoUsuario(req, res, next) {
	const estado = req.body?.estado;

	if (!['Activo', 'Inactivo'].includes(estado)) {
		return errorResponse(
			res,
			400,
			"El estado debe ser 'Activo' o 'Inactivo'",
			'VALIDATION_ERROR'
		);
	}

	try {
		const filasActualizadas = await cambiarEstadoUsuario(req.params.id, estado);

		if (filasActualizadas === 0) {
			return errorResponse(res, 404, 'Usuario no encontrado', 'USER_NOT_FOUND');
		}

		return successResponse(res, 200, 'Estado del usuario actualizado correctamente', {
			id_usuario: Number(req.params.id),
			estado
		});
	} catch (error) {
		return next(error);
	}
}
