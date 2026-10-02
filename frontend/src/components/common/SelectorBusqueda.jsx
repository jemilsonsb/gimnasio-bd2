import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function SelectorBusqueda({
  opciones = [],
  value,
  onChange,
  placeholder = 'Escribe para buscar...',
  disabled = false
}) {
  const [query, setQuery] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [coords, setCoords] = useState(null);

  const contenedorRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  const opcionSeleccionada = opciones.find((o) => String(o.value) === String(value)) || null;

  useEffect(() => {
    if (!abierto) {
      setQuery(opcionSeleccionada?.label ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, value, opciones]);

  const opcionesFiltradas =
    mostrarTodos || query.trim() === ''
      ? opciones
      : opciones.filter((o) => {
          const texto = normalizar(`${o.label} ${o.textoBusqueda || ''}`);
          return texto.includes(normalizar(query));
        });

  function actualizarCoords() {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom, left: rect.left, width: rect.width });
  }

  useLayoutEffect(() => {
    if (!abierto) return undefined;
    actualizarCoords();

    function manejarScrollOResize() {
      actualizarCoords();
    }

    window.addEventListener('scroll', manejarScrollOResize, true);
    window.addEventListener('resize', manejarScrollOResize);
    return () => {
      window.removeEventListener('scroll', manejarScrollOResize, true);
      window.removeEventListener('resize', manejarScrollOResize);
    };
  }, [abierto]);

  useEffect(() => {
    function manejarClicFuera(e) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target) &&
        listaRef.current &&
        !listaRef.current.contains(e.target)
      ) {
        setAbierto(false);
      }
    }

    document.addEventListener('mousedown', manejarClicFuera);
    return () => document.removeEventListener('mousedown', manejarClicFuera);
  }, []);

  function abrirConTodos() {
    if (disabled) return;
    setAbierto(true);
    setMostrarTodos(true);
    setIndiceActivo(-1);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  function seleccionarOpcion(opcion) {
    onChange(opcion.value);
    setQuery(opcion.label);
    setAbierto(false);
    setMostrarTodos(false);
    setIndiceActivo(-1);
  }

  function limpiarSeleccion(e) {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setAbierto(false);
    setMostrarTodos(false);
    inputRef.current?.focus();
  }

  function manejarTeclado(e) {
    if (!abierto && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      abrirConTodos();
      return;
    }

    if (!abierto) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceActivo((i) => Math.min(i + 1, opcionesFiltradas.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indiceActivo >= 0 && opcionesFiltradas[indiceActivo]) {
        seleccionarOpcion(opcionesFiltradas[indiceActivo]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setAbierto(false);
      setMostrarTodos(false);
    }
  }

  const dropdown =
    abierto && coords
      ? createPortal(
          <ul
            ref={listaRef}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: coords.width
            }}
            className="z-[60] mt-1 max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg text-sm"
          >
            {opcionesFiltradas.length === 0 ? (
              <li className="px-3 py-2 text-slate-500">Sin resultados</li>
            ) : (
              opcionesFiltradas.map((o, i) => (
                <li
                  key={o.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    seleccionarOpcion(o);
                  }}
                  onMouseEnter={() => setIndiceActivo(i)}
                  className={`cursor-pointer px-3 py-2 ${
                    i === indiceActivo ? 'bg-sky-50 text-sky-800' : 'text-slate-700'
                  } ${String(o.value) === String(value) ? 'font-semibold' : ''}`}
                >
                  {o.label}
                </li>
              ))
            )}
          </ul>,
          document.body
        )
      : null;

  return (
    <div ref={contenedorRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={abrirConTodos}
          onClick={abrirConTodos}
          onChange={(e) => {
            setQuery(e.target.value);
            setMostrarTodos(false);
            setAbierto(true);
            setIndiceActivo(-1);
          }}
          onKeyDown={manejarTeclado}
          className="w-full rounded-md border border-slate-300 px-3 py-2 pr-8 text-sm focus:border-sky-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
        />
        {opcionSeleccionada && !disabled && (
          <button
            type="button"
            onClick={limpiarSeleccion}
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>
      {dropdown}
    </div>
  );
}
