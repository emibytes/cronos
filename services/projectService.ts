import { getApiConfig } from './apiService';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  color: string;
  status: 'active' | 'inactive';
  tasks_count?: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  code: string;
  message: string;
  data: T;
}

interface PaginatedData {
  projects: Project[];
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    links?: any[];
    path?: string;
    per_page: number;
    to: number;
    total: number;
  };
}

const getProjectConfig = () => {
  const config = getApiConfig();
  return {
    baseURL: config.apiBaseUrl,
    endpoints: {
      list: '/projects',
      create: '/projects',
      show: '/projects',
      update: '/projects',
      delete: '/projects',
    },
  };
};

export interface PaginatedResponse {
  projects: Project[];
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export const projectService = {
  /**
   * Get all projects with pagination
   */
  async getProjects(params?: { 
    status?: 'active' | 'inactive'; 
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse> {
    const config = getProjectConfig();
    const token = localStorage.getItem('emibytes_auth_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const url = `${config.baseURL}${config.endpoints.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<PaginatedData> = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Error al obtener proyectos');
    }

    return {
      projects: apiResponse.data.projects,
      meta: apiResponse.data.meta,
      links: apiResponse.data.links,
    };
  },

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<Project> {
    const config = getProjectConfig();
    const token = localStorage.getItem('emibytes_auth_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.show}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<{ project: Project }> = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Error al obtener proyecto');
    }

    return apiResponse.data.project;
  },

  /**
   * Create a new project
   */
  async createProject(projectData: FormData | Omit<Project, 'id' | 'created_at' | 'updated_at' | 'tasks_count'>): Promise<Project> {
    const config = getProjectConfig();
    const token = localStorage.getItem('emibytes_auth_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const isFormData = projectData instanceof FormData;
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // No agregar Content-Type para FormData, el browser lo hace automáticamente
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.create}`, {
      method: 'POST',
      headers,
      body: isFormData ? projectData : JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData?.errors) {
        const error: any = new Error(errorData.message || 'Error de validación');
        error.errors = errorData.errors;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<{ project: Project }> = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Error al crear proyecto');
    }

    return apiResponse.data.project;
  },

  /**
   * Update an existing project
   */
  async updateProject(id: string, projectData: FormData | Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project> {
    const config = getProjectConfig();
    const token = localStorage.getItem('emibytes_auth_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const isFormData = projectData instanceof FormData;
    
    // Si es FormData, agregar _method para Laravel
    if (isFormData) {
      projectData.append('_method', 'PUT');
    }

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // No agregar Content-Type para FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.update}/${id}`, {
      method: isFormData ? 'POST' : 'PUT',
      headers,
      body: isFormData ? projectData : JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData?.errors) {
        const error: any = new Error(errorData.message || 'Error de validación');
        error.errors = errorData.errors;
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<{ project: Project }> = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Error al actualizar proyecto');
    }

    return apiResponse.data.project;
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    const config = getProjectConfig();
    const token = localStorage.getItem('emibytes_auth_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.delete}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<{}> = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Error al eliminar proyecto');
    }
  },

  /**
   * Get only active projects (for selects, without pagination)
   */
  async getActiveProjects(): Promise<Project[]> {
    const response = await this.getProjects({ status: 'active', per_page: 1000 });
    return response.projects;
  },
};
