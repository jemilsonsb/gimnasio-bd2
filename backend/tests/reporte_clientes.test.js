import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { pool } from '../src/config/database.js';
import { obtenerReporteClientes } from '../src/models/reporte.model.js';

async function contarClientes({ soloActivos = false, fechaInicio, fechaFin } = {}) {
  const condiciones = ["r.nombre_rol = 'Cliente'"];
  const parametros = [];
  if (soloActivos) {
    condiciones.push("e.nombre_estado = 'Activo'");
  }
  if (fechaInicio) {
    condiciones.push('u.fecha_registro >= ?');
    parametros.push(`${fechaInicio} 00:00:00`);
  }
  if (fechaFin) {
    condiciones.push('u.fecha_registro <= ?');
    parametros.push(`${fechaFin} 23:59:59`);
  }

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM cliente c
     INNER JOIN usuario u ON u.id_usuario = c.fk_usuario
     INNER JOIN estado e ON e.id_estado = u.fk_estado
     INNER JOIN rol r ON r.id_rol = u.fk_rol
     WHERE ${condiciones.join(' AND ')}`,
    parametros
  );
  return Number(total);
}

test('reporte de clientes cuenta solo usuarios con rol Cliente y estado Activo', async () => {
  const reporte = await obtenerReporteClientes();

  assert.equal(reporte.resumen.total_activos, await contarClientes({ soloActivos: true }));
});

test('reporte de clientes cuenta nuevos del periodo solo con rol Cliente', async () => {
  const reporte = await obtenerReporteClientes({ fechaInicio: '2000-01-01', fechaFin: '2100-12-31' });

  assert.equal(
    reporte.resumen.nuevos_periodo,
    await contarClientes({ fechaInicio: '2000-01-01', fechaFin: '2100-12-31' })
  );
});

test('reporte de clientes lista en el detalle solo usuarios con rol Cliente', async () => {
  const reporte = await obtenerReporteClientes({ estado: 'Activo' });

  assert.equal(reporte.detalle.length, await contarClientes({ soloActivos: true }));
});

after(async () => {
  await pool.end();
});
