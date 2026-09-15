import { pool } from '../config/database.js';

export async function listarUsuarios() {
	const [filas] = await pool.execute(
		`SELECT u.id_usuario, u.nombre, u.apellido, u.correo,
						r.id_rol, r.nombre_rol, u.estado
			 FROM usuario u
			 INNER JOIN rol r ON r.id_rol = u.fk_rol
			ORDER BY u.id_usuario ASC`
	);

	return filas;
}

export async function cambiarEstadoUsuario(idUsuario, estado) {
	const [resultado] = await pool.execute(
		'UPDATE usuario SET estado = ? WHERE id_usuario = ?',
		[estado, idUsuario]
	);

	return resultado.affectedRows;
}
