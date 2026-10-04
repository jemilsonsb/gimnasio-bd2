import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../services/autenticacion.service.js';
import { BotonEnviar } from '../components/auth/BotonEnviar.jsx';
import { CampoContrasena } from '../components/auth/CampoContrasena.jsx';
import { PanelMarca } from '../components/auth/PanelMarca.jsx';
import { mensajeDeError } from '../utils/errores.js';
import { CAMPOS_SOLO_DIGITOS, erroresDesdeRespuesta, validarFormularioUsuario } from '../utils/validaciones.js';

const formularioInicial = {
  nombre: '',
  apellido: '',
  documento_identidad: '',
  correo: '',
  contrasena: '',
  telefono: ''
};

const claseCampo = 'rounded border border-slate-300 px-3 py-2 font-normal';
const claseError = 'text-xs font-normal text-red-600';

export function RegisterPage() {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Crear cuenta | Gimnasio';
  }, []);

  function manejarCambio(event) {
    const { name } = event.target;
    const valor = CAMPOS_SOLO_DIGITOS.includes(name) ? event.target.value.replace(/\D/g, '') : event.target.value;
    setFormulario((actual) => ({ ...actual, [name]: valor }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  }

  async function manejarEnvio(event) {
    event.preventDefault();
    setMensaje('');
    setError('');

    const erroresValidacion = validarFormularioUsuario(formulario);
    setErrores(erroresValidacion);
    if (Object.keys(erroresValidacion).length > 0) return;

    setEnviando(true);

    try {
      await registrarUsuario(formulario);
      setMensaje('Usuario registrado correctamente.');
      setFormulario(formularioInicial);
      setErrores({});
      setTimeout(() => navigate('/login'), 1200);
    } catch (respuestaError) {
      const erroresServidor = erroresDesdeRespuesta(respuestaError);
      setErrores(erroresServidor);
      if (Object.keys(erroresServidor).length === 0) {
        setError(mensajeDeError(respuestaError, 'No se pudo registrar el usuario.'));
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-2">
      <PanelMarca />

      <div className="flex min-h-screen items-center justify-center p-6">
        <section className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-slate-800">Crear cuenta</h1>

          <form onSubmit={manejarEnvio} noValidate className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              <label className="flex flex-col gap-1">
                Nombre
                <input name="nombre" value={formulario.nombre} onChange={manejarCambio} required aria-invalid={Boolean(errores.nombre)} className={claseCampo} />
              </label>
              {errores.nombre && <p className={claseError}>{errores.nombre}</p>}
            </div>

            <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              <label className="flex flex-col gap-1">
                Apellido
                <input name="apellido" value={formulario.apellido} onChange={manejarCambio} required aria-invalid={Boolean(errores.apellido)} className={claseCampo} />
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
                  className={claseCampo}
                />
              </label>
              {errores.documento_identidad && <p className={claseError}>{errores.documento_identidad}</p>}
            </div>

            <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              <label className="flex flex-col gap-1">
                Correo
                <input type="email" name="correo" value={formulario.correo} onChange={manejarCambio} required autoComplete="email" aria-invalid={Boolean(errores.correo)} className={claseCampo} />
              </label>
              {errores.correo && <p className={claseError}>{errores.correo}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <CampoContrasena
                etiqueta="Contraseña"
                name="contrasena"
                value={formulario.contrasena}
                onChange={manejarCambio}
                required
                minLength={6}
                autoComplete="new-password"
                aria-invalid={Boolean(errores.contrasena)}
              />
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
                  className={claseCampo}
                />
              </label>
              {errores.telefono && <p className={claseError}>{errores.telefono}</p>}
            </div>

            <div className="sm:col-span-2">
              {mensaje && (
                <p role="status" className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {mensaje}
                </p>
              )}
              {error && (
                <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <BotonEnviar
                cargando={enviando}
                texto="Registrarse"
                textoCargando="Registrando..."
              />
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-sky-700 hover:underline">Inicia sesión aquí</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
