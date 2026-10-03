const RUTAS_ICONOS = {
  usuarios: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M16 5.2a3 3 0 010 5.6M18 14c1.8.6 3 2.3 3 5" />
    </>
  ),
  planes: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3h6v3H9zM9 11h6M9 15h6" />
    </>
  ),
  membresias: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M14 6v3M14 11v2M14 15v3" />
    </>
  ),
  clases: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  reportes: <path d="M3 20h18M7 16v-5M12 16V7M17 16v-9" />,
  rutinas: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3h6v3H9zM9 13l2 2 4-4" />
    </>
  ),
  ejercicios: <path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12" />,
  reservar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M12 13v5M9.5 15.5h5" />
    </>
  ),
  reservas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </>
  ),
  ficha: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  )
};

export function IconoAcceso({ nombre, className = 'h-8 w-8' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {RUTAS_ICONOS[nombre]}
    </svg>
  );
}
