export function PanelMarca() {
  return (
    <aside className="hidden flex-col justify-between bg-linear-to-br from-slate-900 via-slate-800 to-sky-700 p-12 text-white lg:flex">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-600 text-xl font-black text-white shadow">
          G
        </span>
        <span className="text-2xl font-bold tracking-tight">Gimnasio</span>
      </div>

      <p className="max-w-md text-3xl font-semibold leading-snug">
        Entrena con constancia. Gestiona todo en un solo lugar.
      </p>
    </aside>
  );
}
