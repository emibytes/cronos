
// Servicio de autenticación con soporte para API REST de Laravel
// Actualmente usa datos mock, preparado para integración con backend

import { getApiConfig } from './apiService';

interface User {
  id: number;
  name: string;
  email: string;
  token?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

const STORAGE_KEYS = {
  token: 'emibytes_auth_token',
  user: 'emibytes_user_data',
};

// Configuración de API desde variables de entorno (lazy evaluation)
const getAuthConfig = () => {
  const config = getApiConfig();
  const authConfig = {
    baseURL: config.apiBaseUrl,
    endpoints: {
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me',
    },
    useMock: config.mode === 'local', // Mock solo en modo local
  };
  
  // Debug: mostrar configuración de autenticación
  if (import.meta.env.DEV) {
    console.log('🔐 Configuración Auth:', authConfig);
  }
  
  return authConfig;
}

// Datos mock para desarrollo
const MOCK_USERS = [
  {
    id: 1,
    name: 'Eminson Mendoza',
    email: 'admin@emibytes.com',
    password: 'admin123',
  },
  {
    id: 2,
    name: 'Jessica Ahumada Rios',
    email: 'jessica@emibytes.com',
    password: 'jessica123',
  },
];

export const authService = {
  // Login con API o mock
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const API_CONFIG = getAuthConfig();
    
    if (API_CONFIG.useMock) {
      // Simulación de llamada a API (mock)
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = MOCK_USERS.find(
            u => u.email === credentials.email && u.password === credentials.password
          );

          if (user) {
            const token = `mock_token_${user.id}_${Date.now()}`;
            const userData: User = {
              id: user.id,
              name: user.name,
              email: user.email,
              token,
            };

            // Guardar en localStorage
            localStorage.setItem(STORAGE_KEYS.token, token);
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));

            resolve({
              success: true,
              user: userData,
              token,
            });
          } else {
            resolve({
              success: false,
              message: 'Credenciales inválidas',
            });
          }
        }, 800); // Simular latencia de red
      });
    } else {
      // Integración real con Laravel API
      try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.login}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('🔍 Respuesta completa de la API:', { 
          status: response.status, 
          ok: response.ok, 
          data 
        });
        
        // Laravel retorna: { success: true, data: { token, user } }
        if (response.ok && data.success && data.data?.token) {
          const userData: User = {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            token: data.data.token,
          };

          localStorage.setItem(STORAGE_KEYS.token, data.data.token);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));

          return {
            success: true,
            user: userData,
            token: data.data.token,
          };
        } else {
          return {
            success: false,
            message: data.message || 'Error al iniciar sesión',
          };
        }
      } catch (error) {
        console.error('Error en login:', error);
        return {
          success: false,
          message: 'Error de conexión con el servidor',
        };
      }
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    const API_CONFIG = getAuthConfig();
    const token = localStorage.getItem(STORAGE_KEYS.token);

    if (!API_CONFIG.useMock && token) {
      // Llamada a API real para invalidar token
      try {
        await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.logout}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error en logout:', error);
      }
    }

    // Limpiar datos locales
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  },

  // Verificar si hay sesión activa
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    return !!token;
  },

  // Obtener usuario actual
  getCurrentUser: (): User | null => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.user);
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  // Obtener token
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.token);
  },

  // Verificar token con el servidor (solo para API real)
  verifyToken: async (): Promise<boolean> => {
    const API_CONFIG = getAuthConfig();
    
    if (API_CONFIG.useMock) {
      return authService.isAuthenticated();
    }

    const token = authService.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.me}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        authService.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  },
};

// Interceptor para requests futuros (útil cuando se integre la API)
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const API_CONFIG = getAuthConfig();
  const token = authService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expirado o inválido
    authService.logout();
    window.location.href = '/';
  }

  return response;
};
