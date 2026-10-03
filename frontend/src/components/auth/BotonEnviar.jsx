export function BotonEnviar({ cargando, texto, textoCargando }) {
  return (
    <button
      type="submit"
      disabled={cargando}
      className="flex w-full items-center justify-center gap-2 rounded bg-slate-800 px-4 py-2 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {cargando && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
        </svg>
      )}
      {cargando ? textoCargando : texto}
    </button>
  );
}
