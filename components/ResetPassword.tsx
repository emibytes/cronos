import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    // Solo validar si los parámetros ya se procesaron
    const urlParams = new URLSearchParams(window.location.search);
    const hasToken = urlParams.has('token');
    const hasEmail = urlParams.has('email');
    
    // Si se intentó acceder sin parámetros (no están en la URL)
    if (!hasToken || !hasEmail) {
      Swal.fire({
        icon: 'error',
        title: 'Enlace inválido',
        text: 'El enlace de recuperación no es válido. Por favor, solicita un nuevo correo de recuperación.',
        confirmButtonColor: '#138b52',
      }).then(() => {
        navigate('/login');
      });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !passwordConfirmation) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://cronos.test/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: 'Tu contraseña ha sido restablecida exitosamente',
          confirmButtonColor: '#138b52',
        });
        navigate('/login');
      } else {
        setError(data.message || 'No se pudo restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error en reset password:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emibytes-background via-gray-50 to-green-50 dark:from-emibytes-dark-bg dark:via-gray-900 dark:to-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden opacity-5 dark:opacity-10">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emibytes-primary rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-emibytes-dark-card rounded-[32px] shadow-2xl p-8 lg:p-10 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emibytes-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-emibytes-secondary dark:text-white mb-2">
              Restablecer Contraseña
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Ingresa tu nueva contraseña para {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all font-semibold"
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emibytes-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    setError('');
                  }}
                  placeholder="Repite la contraseña"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all font-semibold"
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <CheckCircle size={20} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emibytes-primary transition-colors"
                >
                  {showPasswordConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emibytes-primary text-white rounded-2xl font-black shadow-lg shadow-emibytes-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <Lock size={20} />
                  <span>Restablecer Contraseña</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-emibytes-primary font-medium"
            >
              Volver al inicio de sesión
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Powered by emibytes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
