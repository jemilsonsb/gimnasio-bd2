import { useEffect, useState } from 'react';
import { ReporteAsistencias } from '../components/reporte/ReporteAsistencias.jsx';
import { ReporteIngresos } from '../components/reporte/ReporteIngresos.jsx';
import { ReporteMembresias } from '../components/reporte/ReporteMembresias.jsx';
import { ReporteClases } from '../components/reporte/ReporteClases.jsx';
import { ReporteClientes } from '../components/reporte/ReporteClientes.jsx';
import { ReporteRutinas } from '../components/reporte/ReporteRutinas.jsx';

function obtenerRol() {
  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  return usuario?.nombre_rol;
}

export function ReportesPage() {
  const rol = obtenerRol();
  const esAdministrador = rol === 'Administrador';

  const [pestana, setPestana] = useState('generales');

  const generales = [
    esAdministrador && { id: 'ingresos', titulo: 'Ingresos', render: () => <ReporteIngresos modo="general" /> },
    esAdministrador && { id: 'membresias', titulo: 'Membresías', render: () => <ReporteMembresias modo="general" /> },
    { id: 'clases', titulo: 'Clases', render: () => <ReporteClases modo="general" /> },
    esAdministrador && { id: 'clientes', titulo: 'Clientes', render: () => <ReporteClientes /> },
    esAdministrador && { id: 'asistencias', titulo: 'Asistencias', render: () => <ReporteAsistencias modo="general" /> }
  ].filter(Boolean);

  const especificos = [
    esAdministrador && {
      id: 'pagos-cliente',
      titulo: 'Historial de pagos de un cliente',
      render: () => <ReporteIngresos modo="especifico" />
    },
    esAdministrador && {
      id: 'membresias-cliente-plan',
      titulo: 'Membresías de un cliente o plan',
      render: () => <ReporteMembresias modo="especifico" />
    },
    {
      id: 'reservas-asistentes',
      titulo: 'Reservas de un cliente / asistentes de una clase',
      render: () => <ReporteClases modo="especifico" />
    },
    {
      id: 'rutinas-entrenador-cliente',
      titulo: 'Rutinas por entrenador o cliente',
      render: () => <ReporteRutinas modo="especifico" />
    },
    esAdministrador && {
      id: 'asistencias-cliente-plan',
      titulo: 'Asistencias de un cliente o plan',
      render: () => <ReporteAsistencias modo="especifico" />
    }
  ].filter(Boolean);

  const [subPestanaGeneral, setSubPestanaGeneral] = useState(generales[0]?.id);
  const [subPestanaEspecifico, setSubPestanaEspecifico] = useState(especificos[0]?.id);

  useEffect(() => {
    document.title = 'Reportes';
  }, []);

  const listaActiva = pestana === 'generales' ? generales : especificos;
  const subPestanaActiva = pestana === 'generales' ? subPestanaGeneral : subPestanaEspecifico;
  const establecerSubPestana = pestana === 'generales' ? setSubPestanaGeneral : setSubPestanaEspecifico;
  const reporteActivo = listaActiva.find((item) => item.id === subPestanaActiva) || listaActiva[0];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {esAdministrador ? 'Administración' : 'Entrenamiento'}
          </p>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Reportes</h1>
        </div>

        <div className="mb-4 flex gap-2 border-b border-slate-200">
          {[
            { id: 'generales', titulo: 'Generales' },
            { id: 'especificos', titulo: 'Específicos' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPestana(tab.id)}
              className={`px-4 py-2 text-sm font-semibold ${
                pestana === tab.id
                  ? 'border-b-2 border-sky-600 text-sky-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.titulo}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {listaActiva.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => establecerSubPestana(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                subPestanaActiva === item.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.titulo}
            </button>
          ))}
        </div>

        {reporteActivo ? reporteActivo.render() : (
          <p className="text-sm text-slate-500">No tienes reportes disponibles.</p>
        )}
      </div>
    </main>
  );
}
