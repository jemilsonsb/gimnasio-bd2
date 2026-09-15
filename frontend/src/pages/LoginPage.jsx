import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../services/autenticacion.service.js';

export function LoginPage() {
  const [formulario, setFormulario] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  function manejarCambio(event) {
    const { name, value } = event.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  async function manejarEnvio(event) {
    event.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const respuesta = await iniciarSesion(formulario);
      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
      navigate('/dashboard');
    } catch (respuestaError) {
      setError(respuestaError?.message || 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Iniciar sesión</h1>

        <form onSubmit={manejarEnvio} className="space-y-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Correo
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={manejarCambio}
              required
              className="rounded border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Contraseña
            <input
              type="password"
              name="contrasena"
              value={formulario.contrasena}
              onChange={manejarCambio}
              required
              className="rounded border border-slate-300 px-3 py-2"
            />
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-sky-700 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </section>
    </main>
  );
}
