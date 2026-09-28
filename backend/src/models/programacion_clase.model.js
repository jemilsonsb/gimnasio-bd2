import { pool } from '../config/database.js';

const SELECT_PROGRAMACION = `
  SELECT 
    pc.id_programacion,
    pc.fecha,
    pc.hora_inicio,
    pc.hora_fin,
    pc.cupos_disponibles,
    pc.fk_clase,
    cl.nombre_clase,
    cl.descripcion AS descripcion_clase,
    cl.capacidad_maxima,
    pc.fk_entrenador,
    e.fk_usuario AS id_usuario_entrenador,
    CONCAT(u.nombre, ' ', u.apellido) AS nombre_entrenador,
    u.correo AS correo_entrenador
  FROM programacion_clase pc
  INNER JOIN clase cl ON cl.id_clase = pc.fk_clase
  INNER JOIN entrenador e ON e.id_entrenador = pc.fk_entrenador
  INNER JOIN usuario u ON u.id_usuario = e.fk_usuario
`;

export async function buscarProgramacionPorId(idProgramacion) {
  const [filas] = await pool.execute(
    `${SELECT_PROGRAMACION}
     WHERE pc.id_programacion = ?
     LIMIT 1`,
    [idProgramacion]
  );
  return filas[0] || null;
}

export async function listarProgramaciones() {
  const [filas] = await pool.execute(
    `${SELECT_PROGRAMACION}
     ORDER BY pc.fecha DESC, pc.hora_inicio ASC`
  );
  return filas;
}

export async function listarProgramacionesFuturas() {
  const [filas] = await pool.execute(
    `${SELECT_PROGRAMACION}
     WHERE pc.fecha >= CURDATE()
     ORDER BY pc.fecha ASC, pc.hora_inicio ASC`
  );
  return filas;
}

export async function crearProgramacion({
  fk_clase,
  fk_entrenador,
  fecha,
  hora_inicio,
  hora_fin,
  cupos_disponibles
}) {
  const [resultado] = await pool.execute(
    `INSERT INTO programacion_clase (fk_clase, fk_entrenador, fecha, hora_inicio, hora_fin, cupos_disponibles)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fk_clase, fk_entrenador, fecha, hora_inicio, hora_fin, cupos_disponibles]
  );
  return buscarProgramacionPorId(resultado.insertId);
}
