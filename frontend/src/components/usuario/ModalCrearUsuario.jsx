import { useEffect, useState } from 'react';
import { CAMPOS_SOLO_DIGITOS, erroresDesdeRespuesta, validarFormularioUsuario } from '../../utils/validaciones.js';

const formularioInicial = {
  nombre: '',
  apellido: '',
  documento_identidad: '',
  correo: '',
  contrasena: '',
  telefono: '',
  nombre_rol: 'Cliente',
  codigo_miembro: ''
};

const claseError = 'text-xs font-normal text-red-600';

export function ModalCrearUsuario({ abierto, alCerrar, alGuardar }) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setFormulario(formularioInicial);
      setError('');
      setErrores({});
    }
  }, [abierto]);

  if (!abierto) return null;

  function manejarCambio(e) {
    const { name } = e.target;
    const valor = CAMPOS_SOLO_DIGITOS.includes(name) ? e.target.value.replace(/\D/g, '') : e.target.value;
    setFormulario((prev) => ({ ...prev, [name]: valor }));
    setErrores((prev) => ({ ...prev, [name]: undefined }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError('');

    const erroresValidacion = validarFormularioUsuario(formulario);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) return;

    setEnviando(true);

    try {
      await alGuardar({
        ...formulario,
        codigo_miembro: formulario.nombre_rol === 'Cliente' ? formulario.codigo_miembro || undefined : undefined
      });
      alCerrar();
    } catch (err) {
      const erroresServidor = erroresDesdeRespuesta(err);
      setErrores(erroresServidor);
      if (Object.keys(erroresServidor).length === 0) {
        setError(err?.message || 'No se pudo crear el usuario.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-slate-800">Nuevo usuario</h2>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={manejarEnvio} noValidate className="grid gap-4 sm:grid-cols-2">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200 sm:col-span-2">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <label className="flex flex-col gap-1">
              Nombre
              <input name="nombre" value={formulario.nombre} onChange={manejarCambio} required aria-invalid={Boolean(errores.nombre)} className="rounded border border-slate-300 px-3 py-2" />
            </label>
            {errores.nombre && <p className={claseError}>{errores.nombre}</p>}
          </div>

          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <label className="flex flex-col gap-1">
              Apellido
              <input name="apellido" value={formulario.apellido} onChange={manejarCambio} required aria-invalid={Boolean(errores.apellido)} className="rounded border border-slate-300 px-3 py-2" />
            </label>
            {errores.apellido && <p className={claseError}>{errores.apellido}</p>}
          </div>

          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <label className="flex flex-col gap-1">
              Documento de identidad
              <input
                name="documento_identidad"
                value={formulario.documento_identidad}
                onChange={manejarCambio}
                required
                inputMode="numeric"
                maxLength={10}
                aria-invalid={Boolean(errores.documento_identidad)}
                className="rounded border border-slate-300 px-3 py-2"
              />
            </label>
            {errores.documento_identidad && <p className={claseError}>{errores.documento_identidad}</p>}
          </div>

          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <label className="flex flex-col gap-1">
              Correo
              <input type="email" name="correo" value={formulario.correo} onChange={manejarCambio} required aria-invalid={Boolean(errores.correo)} className="rounded border border-slate-300 px-3 py-2" />
            </label>
            {errores.correo && <p className={claseError}>{errores.correo}</p>}
          </div>

          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <label className="flex flex-col gap-1">
              Contraseña
              <input type="password" name="contrasena" value={formulario.contrasena} onChange={manejarCambio} required minLength="6" aria-invalid={Boolean(errores.contrasena)} className="rounded border border-slate-300 px-3 py-2" />
            </label>
            {errores.contrasena && <p className={claseError}>{errores.contrasena}</p>}
          </div>

          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            <label className="flex flex-col gap-1">
              Teléfono
              <input
                name="telefono"
                value={formulario.telefono}
                onChange={manejarCambio}
                inputMode="numeric"
                maxLength={10}
                aria-invalid={Boolean(errores.telefono)}
                className="rounded border border-slate-300 px-3 py-2"
              />
            </label>
            {errores.telefono && <p className={claseError}>{errores.telefono}</p>}
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Rol
            <select
              name="nombre_rol"
              value={formulario.nombre_rol}
              onChange={manejarCambio}
              required
              className="rounded border border-slate-300 px-3 py-2"
            >
              <option value="Cliente">Cliente</option>
              <option value="Entrenador">Entrenador</option>
              <option value="Administrador">Administrador</option>
            </select>
          </label>

          {formulario.nombre_rol === 'Cliente' && (
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Código de miembro (opcional)
              <input name="codigo_miembro" value={formulario.codigo_miembro} onChange={manejarCambio} className="rounded border border-slate-300 px-3 py-2" />
            </label>
          )}

          <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
            <button
              type="button"
              onClick={alCerrar}
              disabled={enviando}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition disabled:opacity-50"
            >
              {enviando ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
