
import React, { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        onLoginSuccess();
      } else {
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para autocompletar credenciales de prueba
  const fillTestCredentials = (userType: 'admin' | 'user') => {
    if (userType === 'admin') {
      setEmail('admin@emibytes.com');
      setPassword('admin123');
    } else {
      setEmail('jessica@emibytes.com');
      setPassword('jessica123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emibytes-background via-gray-50 to-green-50 dark:from-emibytes-dark-bg dark:via-gray-900 dark:to-gray-900 p-4">
      {/* Patron de fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden opacity-5 dark:opacity-10">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emibytes-primary rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white dark:bg-emibytes-dark-card rounded-[32px] shadow-2xl p-8 lg:p-10 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-500">
          {/* Logo y Header */}
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="emibytes"
                  className="h-20 w-auto object-contain hover:scale-105 transition-transform"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-20 h-20 bg-emibytes-primary rounded-2xl flex items-center justify-center">
                  <LogIn size={40} className="text-white" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-black text-emibytes-secondary dark:text-white mb-2">
              Bienvenido
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Inicia sesión para acceder a Cronos
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emibytes-primary focus:border-transparent outline-none transition-all font-semibold"
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emibytes-primary text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-emibytes-primary/30 hover:shadow-xl hover:shadow-emibytes-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Credenciales de prueba (solo en modo mock) */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-black text-center mb-3">
              Credenciales de Prueba
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillTestCredentials('admin')}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-bold transition-colors border border-gray-200 dark:border-gray-700"
              >
                👨‍💼 Admin
              </button>
              <button
                type="button"
                onClick={() => fillTestCredentials('user')}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-bold transition-colors border border-gray-200 dark:border-gray-700"
              >
                👩 Usuario
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Powered by emibytes
            </p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            ¿Olvidaste tu contraseña?{' '}
            <button className="text-emibytes-primary font-bold hover:underline">
              Recuperar acceso
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
