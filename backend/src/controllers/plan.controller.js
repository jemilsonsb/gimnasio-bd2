import {
  actualizarPlan,
  buscarPlanPorId,
  crearPlan,
  listarPlanes
} from '../models/plan.model.js';
import { errorResponse, successResponse } from '../utils/api-response.js';

export async function obtenerPlanes(req, res, next) {
  try {
    const soloActivos = req.query.todos !== 'true';
    const planes = await listarPlanes({ soloActivos });
    return successResponse(res, 200, 'Planes obtenidos correctamente', planes);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerPlanPorId(req, res, next) {
  try {
    const idPlan = Number(req.params.id);
    if (isNaN(idPlan) || idPlan <= 0) {
      return errorResponse(res, 400, 'El ID del plan no es válido', 'INVALID_ID');
    }

    const plan = await buscarPlanPorId(idPlan);
    if (!plan) {
      return errorResponse(res, 404, 'Plan no encontrado', 'PLAN_NOT_FOUND');
    }

    return successResponse(res, 200, 'Plan obtenido correctamente', plan);
  } catch (error) {
    return next(error);
  }
}

function validarIngresosIncluidos(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return { valido: true, valor: null };
  }

  const numero = Number(valor);
  if (isNaN(numero) || !Number.isInteger(numero) || numero <= 0) {
    return { valido: false };
  }

  return { valido: true, valor: numero };
}

export async function crearNuevoPlan(req, res, next) {
  const { nombre_plan, descripcion, duracion_dias, precio, ingresos_incluidos, activo } = req.body;

  const dias = Number(duracion_dias);
  const valorPrecio = Number(precio);

  if (isNaN(dias) || !Number.isInteger(dias) || dias <= 0) {
    return errorResponse(
      res,
      400,
      'La duración en días debe ser un número entero mayor a 0',
      'VALIDATION_ERROR'
    );
  }

  if (isNaN(valorPrecio) || valorPrecio < 0) {
    return errorResponse(
      res,
      400,
      'El precio debe ser un número mayor o igual a 0',
      'VALIDATION_ERROR'
    );
  }

  const vIngresosIncluidos = validarIngresosIncluidos(ingresos_incluidos);
  if (!vIngresosIncluidos.valido) {
    return errorResponse(
      res,
      400,
      'Los ingresos incluidos deben ser un número entero mayor a 0, o vacío para ilimitado',
      'VALIDATION_ERROR'
    );
  }

  try {
    const planCreado = await crearPlan({
      nombre_plan: nombre_plan.trim(),
      descripcion: descripcion ? String(descripcion).trim() : null,
      duracion_dias: dias,
      precio: valorPrecio,
      ingresos_incluidos: vIngresosIncluidos.valor,
      activo: activo !== undefined ? Boolean(activo) : 1
    });

    return successResponse(res, 201, 'Plan creado correctamente', planCreado);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 409, 'Ya existe un plan con el mismo nombre', 'DUPLICATE_PLAN');
    }
    return next(error);
  }
}

export async function modificarPlan(req, res, next) {
  const idPlan = Number(req.params.id);
  if (isNaN(idPlan) || idPlan <= 0) {
    return errorResponse(res, 400, 'El ID del plan no es válido', 'INVALID_ID');
  }

  const { nombre_plan, descripcion, duracion_dias, precio, ingresos_incluidos, activo } = req.body;

  const campos = {};
  if (nombre_plan !== undefined) {
    if (typeof nombre_plan !== 'string' || nombre_plan.trim() === '') {
      return errorResponse(res, 400, 'El nombre del plan no puede estar vacío', 'VALIDATION_ERROR');
    }
    campos.nombre_plan = nombre_plan.trim();
  }

  if (descripcion !== undefined) {
    campos.descripcion = descripcion ? String(descripcion).trim() : null;
  }

  if (duracion_dias !== undefined) {
    const dias = Number(duracion_dias);
    if (isNaN(dias) || !Number.isInteger(dias) || dias <= 0) {
      return errorResponse(
        res,
        400,
        'La duración en días debe ser un número entero mayor a 0',
        'VALIDATION_ERROR'
      );
    }
    campos.duracion_dias = dias;
  }

  if (precio !== undefined) {
    const valorPrecio = Number(precio);
    if (isNaN(valorPrecio) || valorPrecio < 0) {
      return errorResponse(
        res,
        400,
        'El precio debe ser un número mayor o igual a 0',
        'VALIDATION_ERROR'
      );
    }
    campos.precio = valorPrecio;
  }

  if (ingresos_incluidos !== undefined) {
    const vIngresosIncluidos = validarIngresosIncluidos(ingresos_incluidos);
    if (!vIngresosIncluidos.valido) {
      return errorResponse(
        res,
        400,
        'Los ingresos incluidos deben ser un número entero mayor a 0, o vacío para ilimitado',
        'VALIDATION_ERROR'
      );
    }
    campos.ingresos_incluidos = vIngresosIncluidos.valor;
  }

  if (activo !== undefined) {
    campos.activo = Boolean(activo);
  }

  try {
    const planActualizado = await actualizarPlan(idPlan, campos);
    if (!planActualizado) {
      return errorResponse(res, 404, 'Plan no encontrado', 'PLAN_NOT_FOUND');
    }

    return successResponse(res, 200, 'Plan actualizado correctamente', planActualizado);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 409, 'Ya existe un plan con el mismo nombre', 'DUPLICATE_PLAN');
    }
    return next(error);
  }
}
