import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluarIngreso, seleccionarMembresiaVigente } from '../src/utils/asistencia-reglas.js';

// ─── seleccionarMembresiaVigente ────────────────────────────────────────────────

test('seleccionarMembresiaVigente elige la membresía vigente con vencimiento más próximo', () => {
  const membresias = [
    { id_membresia: 1, estado_membresia: 'Activa', fecha_inicio: '2026-01-01', fecha_vencimiento: '2026-12-31', ingresos_incluidos: null },
    { id_membresia: 2, estado_membresia: 'Activa', fecha_inicio: '2026-01-01', fecha_vencimiento: '2026-10-15', ingresos_incluidos: 10 }
  ];

  const resultado = seleccionarMembresiaVigente(membresias, '2026-10-02');

  assert.equal(resultado.id_membresia, 2);
});

test('seleccionarMembresiaVigente descarta una membresía vencida', () => {
  const membresias = [
    { id_membresia: 1, estado_membresia: 'Activa', fecha_inicio: '2026-01-01', fecha_vencimiento: '2026-09-30', ingresos_incluidos: null }
  ];

  const resultado = seleccionarMembresiaVigente(membresias, '2026-10-02');

  assert.equal(resultado, null);
});

test('seleccionarMembresiaVigente descarta una membresía cancelada', () => {
  const membresias = [
    { id_membresia: 1, estado_membresia: 'Cancelada', fecha_inicio: '2026-01-01', fecha_vencimiento: '2026-12-31', ingresos_incluidos: null }
  ];

  const resultado = seleccionarMembresiaVigente(membresias, '2026-10-02');

  assert.equal(resultado, null);
});

test('seleccionarMembresiaVigente devuelve null cuando no hay membresías', () => {
  const resultado = seleccionarMembresiaVigente([], '2026-10-02');

  assert.equal(resultado, null);
});

// ─── evaluarIngreso ──────────────────────────────────────────────────────────

test('evaluarIngreso permite el ingreso cuando la membresía es ilimitada', () => {
  const resultado = evaluarIngreso({
    ingresosIncluidos: null,
    ingresosRegistrados: 50,
    yaIngresoHoy: false
  });

  assert.equal(resultado.codigo, 'OK');
  assert.equal(resultado.ingresosRestantes, null);
});

test('evaluarIngreso permite el ingreso y descuenta un cupo en una tiquetera con saldo', () => {
  const resultado = evaluarIngreso({
    ingresosIncluidos: 10,
    ingresosRegistrados: 3,
    yaIngresoHoy: false
  });

  assert.equal(resultado.codigo, 'OK');
  assert.equal(resultado.ingresosRestantes, 6);
});

test('evaluarIngreso rechaza el ingreso cuando no quedan cupos (sin ingresos)', () => {
  const resultado = evaluarIngreso({
    ingresosIncluidos: 10,
    ingresosRegistrados: 10,
    yaIngresoHoy: false
  });

  assert.equal(resultado.codigo, 'NO_ENTRIES_LEFT');
});

test('evaluarIngreso rechaza el ingreso si el cliente ya entró hoy', () => {
  const resultado = evaluarIngreso({
    ingresosIncluidos: 10,
    ingresosRegistrados: 4,
    yaIngresoHoy: true
  });

  assert.equal(resultado.codigo, 'ALREADY_CHECKED_IN');
});

test('evaluarIngreso prioriza sin-ingresos sobre ya-entro-hoy cuando ambos aplican', () => {
  const resultado = evaluarIngreso({
    ingresosIncluidos: 1,
    ingresosRegistrados: 1,
    yaIngresoHoy: true
  });

  assert.equal(resultado.codigo, 'NO_ENTRIES_LEFT');
});
