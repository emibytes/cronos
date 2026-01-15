
// Servicio de API REST para integración con Laravel
// Soporta modo local (localStorage) y modo producción (API REST)

import { authService } from './authService';

// Extender ImportMeta para incluir env
declare global {
  interface ImportMeta {
    env: {
      VITE_APP_MODE?: string;
      VITE_API_BASE_URL?: string;
      VITE_API_TOKEN?: string;
      VITE_API_TASKS_ENDPOINT?: string;
    };
  }
}

// Configuración desde variables de entorno
const ENV_CONFIG = {
  mode: (import.meta.env.VITE_APP_MODE || 'local') as 'local' | 'production',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://cronos.test/api',
  apiToken: import.meta.env.VITE_API_TOKEN || '',
  tasksEndpoint: import.meta.env.VITE_API_TASKS_ENDPOINT || '/tasks',
};

// Debug: Log de configuración en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 Configuración API:', ENV_CONFIG);
}

export const isLocalMode = () => ENV_CONFIG.mode === 'local';
export const isProductionMode = () => ENV_CONFIG.mode === 'production';

// Interfaz de respuesta de Laravel
interface LaravelResponse<T> {
  success: boolean;
  status: number;
  code: string;
  message: string;
  data: T;
}

interface PaginatedData<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV_CONFIG.apiBaseUrl;
  }

  // Obtener headers para las peticiones
  private getHeaders(): HeadersInit {
    const token = authService.getToken() || ENV_CONFIG.apiToken;
    
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Construir URL completa
  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  // Manejo de errores de respuesta
  private async handleResponse<T>(response: Response): Promise<LaravelResponse<T>> {
    if (response.status === 401) {
      // Token expirado o inválido
      authService.logout();
      window.location.href = '/';
      throw new Error('Sesión expirada');
    }

    if (response.status === 204) {
      // No Content (para DELETE exitoso)
      return {
        success: true,
        status: 204,
        code: 'HTTP_NO_CONTENT',
        message: 'Operación exitosa',
        data: {} as T,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  }

  // GET - Obtener lista de recursos
  async getList<T>(endpoint: string, params?: Record<string, string>): Promise<LaravelResponse<T>> {
    const url = new URL(this.buildUrl(endpoint));
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // GET - Obtener un recurso específico
  async getOne<T>(endpoint: string, id: string): Promise<LaravelResponse<T>> {
    const response = await fetch(this.buildUrl(`${endpoint}/${id}`), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // POST - Crear un recurso
  async create<T>(endpoint: string, data: Record<string, any>): Promise<LaravelResponse<T>> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  // PUT - Actualizar un recurso
  async update<T>(endpoint: string, id: string, data: Record<string, any>): Promise<LaravelResponse<T>> {
    const response = await fetch(this.buildUrl(`${endpoint}/${id}`), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  // PATCH - Actualización parcial
  async patch<T>(endpoint: string, id: string, data: Record<string, any>): Promise<LaravelResponse<T>> {
    const response = await fetch(this.buildUrl(`${endpoint}/${id}`), {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  // DELETE - Eliminar un recurso
  async delete(endpoint: string, id: string): Promise<LaravelResponse<{}>> {
    const response = await fetch(this.buildUrl(`${endpoint}/${id}`), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{}>(response);
  }

  // Método genérico para requests personalizados
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<LaravelResponse<T>> {
    const response = await fetch(this.buildUrl(endpoint), {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  // Obtener frase motivacional del día
  async getDailyQuote(): Promise<LaravelResponse<{ quote: string }>> {
    const user = authService.getCurrentUser();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const response = await fetch(
      this.buildUrl(`/tasks?project=Crecimiento profesional&responsible=${user?.email || ''}&date=${today}`),
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<{ quote: string }>(response);
  }
}

// Exportar instancia única del servicio
export const apiService = new ApiService();

// Exportar configuración para uso externo
export const getApiConfig = () => ENV_CONFIG;
