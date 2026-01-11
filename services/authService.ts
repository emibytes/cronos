
// Servicio de autenticación con soporte para API REST de Laravel
// Actualmente usa datos mock, preparado para integración con backend

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

// Configuración de API - cambiar cuando esté lista la API de Laravel
const API_CONFIG = {
  baseURL: 'http://localhost:8000/api', // URL de tu API Laravel
  endpoints: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  useMock: true, // Cambiar a false cuando la API esté lista
};

const STORAGE_KEYS = {
  token: 'emibytes_auth_token',
  user: 'emibytes_user_data',
};

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

        if (response.ok && data.token) {
          const userData: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            token: data.token,
          };

          localStorage.setItem(STORAGE_KEYS.token, data.token);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));

          return {
            success: true,
            user: userData,
            token: data.token,
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
