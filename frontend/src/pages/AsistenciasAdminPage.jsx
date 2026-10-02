import { useEffect, useState } from 'react';
import { registrarAsistencia } from '../services/asistencia.service.js';
import { obtenerClientes } from '../services/cliente.service.js';

const MENSAJES_ERROR = {
  CLIENT_NOT_FOUND: 'Cliente no encontrado.',
  MEMBERSHIP_REQUIRED: 'El cliente no tiene una membresía vigente.',
  NO_ENTRIES_LEFT: 'El cliente no tiene ingresos disponibles en su tiquetera.',
  ALREADY_CHECKED_IN: 'El cliente ya registró su ingreso hoy.'
};

export function AsistenciasAdminPage() {
  const [clientes, setClientes] = useState([]);
  const [fkCliente, setFkCliente] = useState('');
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [registrando, setRegistrando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Control de Asistencia | Gimnasio BD2';
    cargarClientes();
  }, []);

  async function cargarClientes() {
    setCargandoClientes(true);
    try {
      const respuesta = await obtenerClientes();
      setClientes(respuesta.data || []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los clientes.');
    } finally {
      setCargandoClientes(false);
    }
  }

  async function manejarRegistro(e) {
    e.preventDefault();
    setError('');
    setResultado(null);

    if (!fkCliente) {
      setError('Debes seleccionar un cliente.');
      return;
    }

    setRegistrando(true);
    try {
      const respuesta = await registrarAsistencia({ fk_cliente: Number(fkCliente) });
      setResultado(respuesta.data);
    } catch (err) {
      setError(MENSAJES_ERROR[err?.error?.code] || err?.message || 'Error al registrar el ingreso.');
    } finally {
      setRegistrando(false);
    }
  }

  const clienteSeleccionado = clientes.find((c) => String(c.id_cliente) === String(fkCliente));

  return (
    <>
      <div className="mb-6 border-b border-slate-100 pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Administración</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Control de Asistencia</h1>
        <p className="text-sm text-slate-600 mt-1">
          Registra el ingreso diario de un cliente al gimnasio.
        </p>
      </div>

      <div className="max-w-xl rounded-xl bg-white p-6 shadow-md">
        <form onSubmit={manejarRegistro} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
            <select
              value={fkCliente}
              onChange={(e) => {
                setFkCliente(e.target.value);
                setResultado(null);
                setError('');
              }}
              disabled={cargandoClientes}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            >
              <option value="">
                {cargandoClientes ? 'Cargando clientes...' : 'Selecciona un cliente'}
              </option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre} {c.apellido}
                  {c.codigo_miembro ? ` (${c.codigo_miembro})` : ''}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {resultado && (
            <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200">
              <p className="font-semibold">
                Ingreso registrado para {clienteSeleccionado?.nombre} {clienteSeleccionado?.apellido}.
              </p>
              <p className="mt-1">
                {resultado.ingresos_incluidos === null
                  ? 'Membresía ilimitada.'
                  : `Ingresos restantes: ${resultado.ingresos_restantes} de ${resultado.ingresos_incluidos}.`}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={registrando || cargandoClientes}
            className="w-full rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition disabled:opacity-50"
          >
            {registrando ? 'Registrando...' : 'Registrar ingreso'}
          </button>
        </form>
      </div>
    </>
  );
}
