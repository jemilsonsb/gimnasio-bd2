import { pool } from '../config/database.js';

export async function buscarFichaPorCliente(idCliente) {
  const [filas] = await pool.execute(
    `SELECT 
       ft.id_ficha,
       ft.fk_cliente,
       ft.peso_kg,
       ft.estatura,
       ft.porcentaje_grasa,
       ft.observaciones_medicas,
       ft.objetivos,
       ft.fecha_actualizacion,
       c.codigo_miembro,
       c.fk_usuario AS id_usuario_cliente,
       CONCAT(u.nombre, ' ', u.apellido) AS nombre_cliente,
       u.correo AS correo_cliente
     FROM ficha_tecnica ft
     INNER JOIN cliente c ON c.id_cliente = ft.fk_cliente
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     WHERE ft.fk_cliente = ?
     LIMIT 1`,
    [idCliente]
  );
  return filas[0] || null;
}

export async function upsertFichaTecnica({
  fk_cliente,
  peso_kg,
  estatura,
  porcentaje_grasa = null,
  observaciones_medicas = null,
  objetivos = null
}) {
  await pool.execute(
    `INSERT INTO ficha_tecnica 
       (fk_cliente, peso_kg, estatura, porcentaje_grasa, observaciones_medicas, objetivos, fecha_actualizacion)
     VALUES (?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       peso_kg = VALUES(peso_kg),
       estatura = VALUES(estatura),
       porcentaje_grasa = VALUES(porcentaje_grasa),
       observaciones_medicas = VALUES(observaciones_medicas),
       objetivos = VALUES(objetivos),
       fecha_actualizacion = NOW()`,
    [fk_cliente, peso_kg, estatura, porcentaje_grasa, observaciones_medicas, objetivos]
  );

  return buscarFichaPorCliente(fk_cliente);
}
