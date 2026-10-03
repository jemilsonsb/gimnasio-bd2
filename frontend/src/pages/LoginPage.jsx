import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../services/autenticacion.service.js';
import { BotonEnviar } from '../components/auth/BotonEnviar.jsx';
import { CampoContrasena } from '../components/auth/CampoContrasena.jsx';
import { PanelMarca } from '../components/auth/PanelMarca.jsx';
import { mensajeDeError } from '../utils/errores.js';

export function LoginPage() {
  const [formulario, setFormulario] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Iniciar sesión | Gimnasio';
  }, []);

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
      setError(mensajeDeError(respuestaError, 'No se pudo iniciar sesión.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-2">
      <PanelMarca />

      <div className="flex min-h-screen items-center justify-center p-6">
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
                autoComplete="email"
                className="rounded border border-slate-300 px-3 py-2 font-normal"
              />
            </label>

            <CampoContrasena
              etiqueta="Contraseña"
              name="contrasena"
              value={formulario.contrasena}
              onChange={manejarCambio}
              required
              autoComplete="current-password"
            />

            {error && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <BotonEnviar
              cargando={enviando}
              texto="Iniciar sesión"
              textoCargando="Iniciando sesión..."
            />
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-sky-700 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
