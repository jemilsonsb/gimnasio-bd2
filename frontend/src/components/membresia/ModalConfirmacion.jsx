export function ModalConfirmacion({
  abierto,
  alCerrar,
  alConfirmar,
  titulo = 'Confirmar acción',
  mensaje = '¿Estás seguro de que deseas realizar esta acción?',
  cargando = false
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
        <h3 className="text-lg font-bold text-slate-800">{titulo}</h3>
        <p className="mt-2 text-sm text-slate-600">{mensaje}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={alCerrar}
            disabled={cargando}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={alConfirmar}
            disabled={cargando}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {cargando ? 'Cancelando...' : 'Sí, cancelar membresía'}
          </button>
        </div>
      </div>
    </div>
  );
}
