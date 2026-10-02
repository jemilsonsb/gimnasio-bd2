import { pool } from '../config/database.js';

export async function listarUsuarios() {
	const [filas] = await pool.execute(
		`SELECT u.id_usuario, u.nombre, u.apellido, u.correo,
						r.id_rol, r.nombre_rol,
						e.id_estado, e.nombre_estado AS estado,
						(u.bloqueado_hasta IS NOT NULL AND u.bloqueado_hasta > NOW()) AS bloqueado
				 FROM usuario u
				 INNER JOIN rol r ON r.id_rol = u.fk_rol
				 INNER JOIN estado e ON e.id_estado = u.fk_estado
			ORDER BY u.id_usuario ASC`
	);

	return filas.map((fila) => ({ ...fila, bloqueado: Boolean(fila.bloqueado) }));
}

export async function cambiarEstadoUsuario(idUsuario, estado) {
	const [estadoFila] = await pool.execute(
		'SELECT id_estado FROM estado WHERE nombre_estado = ? LIMIT 1',
		[estado]
	);

	if (!estadoFila[0]) {
		return 0;
	}

	const [resultado] = await pool.execute(
		'UPDATE usuario SET fk_estado = ? WHERE id_usuario = ?',
		[estadoFila[0].id_estado, idUsuario]
	);

	return resultado.affectedRows;
}

export async function desbloquearUsuario(idUsuario) {
	const [resultado] = await pool.execute(
		'UPDATE usuario SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = ?',
		[idUsuario]
	);

	return resultado.affectedRows;
}
