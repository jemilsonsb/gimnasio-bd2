import { useState } from 'react';

export function CampoContrasena({ etiqueta, name, ...propiedades }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      <label htmlFor={name}>{etiqueta}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          {...propiedades}
          className="w-full rounded border border-slate-300 py-2 pl-3 pr-20 font-normal"
        />
        <button
          type="button"
          onClick={() => setVisible((actual) => !actual)}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-sky-700 hover:text-sky-900"
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </div>
  );
}
