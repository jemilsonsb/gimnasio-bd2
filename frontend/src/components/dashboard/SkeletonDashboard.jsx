const bloque = 'animate-pulse rounded bg-slate-200';

function TarjetaSkeleton() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <div className={`h-4 w-1/2 ${bloque}`} />
      <div className={`mt-3 h-8 w-2/3 ${bloque}`} />
    </div>
  );
}

function TablaSkeleton() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-md">
      <div className={`mb-4 h-4 w-1/3 ${bloque}`} />
      {[0, 1, 2].map((indice) => (
        <div key={indice} className={`mb-3 h-6 ${bloque}`} />
      ))}
    </div>
  );
}

export function SkeletonDashboard({ rol }) {
  let tarjetas = 3;
  let tablas = 0;
  let clasesTarjetas = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
  let clasesTablas = 'grid grid-cols-1 gap-6 lg:grid-cols-2';

  if (rol === 'Administrador') {
    tarjetas = 4;
    tablas = 4;
    clasesTarjetas = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4';
  } else if (rol === 'Entrenador') {
    tarjetas = 2;
    tablas = 2;
    clasesTarjetas = 'grid grid-cols-1 gap-4 sm:grid-cols-2';
  }

  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Cargando información del panel...</span>

      <div className={clasesTarjetas}>
        {Array.from({ length: tarjetas }, (_, indice) => (
          <TarjetaSkeleton key={indice} />
        ))}
      </div>

      {tablas > 0 && (
        <div className={clasesTablas}>
          {Array.from({ length: tablas }, (_, indice) => (
            <TablaSkeleton key={indice} />
          ))}
        </div>
      )}
    </div>
  );
}
