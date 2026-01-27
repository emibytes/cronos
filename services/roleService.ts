import { getApiConfig } from './apiService';

export interface Menu {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  url?: string;
  order?: number;
  parent_id?: string | null;
  can_view?: boolean;
  can_create?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
}

export interface MenuPermission {
  menu_id: string;
  menu_name?: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_super_admin: boolean;
  status: 'active' | 'inactive';
  users_count?: number;
  menus?: Menu[];
  permissions?: MenuPermission[];
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
  roles: Role[];
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

const getRoleConfig = () => {
  const config = getApiConfig();
  return {
    baseURL: config.apiBaseUrl,
    endpoints: {
      list: '/admin/roles',
      create: '/admin/roles',
      show: '/admin/roles',
      update: '/admin/roles',
      delete: '/admin/roles',
      assignMenus: '/admin/roles',
      getMenus: '/admin/roles',
    },
  };
};

export interface PaginatedResponse {
  roles: Role[];
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

export const roleService = {
  /**
   * Get all roles with pagination
   */
  async getRoles(params?: {
    status?: 'active' | 'inactive';
    search?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<PaginatedResponse> {
    const config = getRoleConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `${config.baseURL}${config.endpoints.list}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch roles');
    }

    const result: ApiResponse<PaginatedData> = await response.json();
    return result.data;
  },

  /**
   * Get a single role by ID
   */
  async getRole(id: string): Promise<Role> {
    const config = getRoleConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.show}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch role');
    }

    const result: ApiResponse<{ role: Role }> = await response.json();
    return result.data.role;
  },

  /**
   * Create a new role
   */
  async createRole(roleData: {
    name: string;
    slug: string;
    description?: string | null;
    is_super_admin?: boolean;
    status?: 'active' | 'inactive';
    menus?: MenuPermission[];
  }): Promise<Role> {
    const config = getRoleConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.create}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create role');
    }

    const result: ApiResponse<{ role: Role }> = await response.json();
    return result.data.role;
  },

  /**
   * Update an existing role
   */
  async updateRole(
    id: string,
    roleData: {
      name?: string;
      slug?: string;
      description?: string | null;
      is_super_admin?: boolean;
      status?: 'active' | 'inactive';
      menus?: MenuPermission[];
    }
  ): Promise<Role> {
    const config = getRoleConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.update}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update role');
    }

    const result: ApiResponse<{ role: Role }> = await response.json();
    return result.data.role;
  },

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<void> {
    const config = getRoleConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.delete}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete role');
    }
  },

  /**
   * Assign menus with permissions to a role
   */
  async assignMenus(id: string, menus: MenuPermission[]): Promise<Role> {
    const config = getRoleConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.assignMenus}/${id}/menus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ menus }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to assign menus');
    }

    const result: ApiResponse<{ role: Role }> = await response.json();
    return result.data.role;
  },

  /**
   * Get menus assigned to a role
   */
  async getMenus(id: string): Promise<Menu[]> {
    const config = getRoleConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.getMenus}/${id}/menus`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch menus');
    }

    const result: ApiResponse<{ menus: Menu[] }> = await response.json();
    return result.data.menus;
  },
};
