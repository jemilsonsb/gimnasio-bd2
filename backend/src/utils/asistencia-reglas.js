export function seleccionarMembresiaVigente(membresias, hoy) {
  const vigentes = membresias.filter(
    (m) => m.estado_membresia !== 'Cancelada' && hoy >= m.fecha_inicio && hoy <= m.fecha_vencimiento
  );

  if (vigentes.length === 0) {
    return null;
  }

  return vigentes.reduce((masProxima, actual) =>
    actual.fecha_vencimiento < masProxima.fecha_vencimiento ? actual : masProxima
  );
}

export function evaluarIngreso({ ingresosIncluidos, ingresosRegistrados, yaIngresoHoy }) {
  if (ingresosIncluidos !== null && ingresosIncluidos !== undefined && ingresosRegistrados >= ingresosIncluidos) {
    return { codigo: 'NO_ENTRIES_LEFT', ingresosRestantes: 0 };
  }

  if (yaIngresoHoy) {
    return {
      codigo: 'ALREADY_CHECKED_IN',
      ingresosRestantes:
        ingresosIncluidos === null || ingresosIncluidos === undefined
          ? null
          : ingresosIncluidos - ingresosRegistrados
    };
  }

  return {
    codigo: 'OK',
    ingresosRestantes:
      ingresosIncluidos === null || ingresosIncluidos === undefined
        ? null
        : ingresosIncluidos - ingresosRegistrados - 1
  };
}
