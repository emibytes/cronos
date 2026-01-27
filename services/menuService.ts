import { getApiConfig } from './apiService';

export interface Menu {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  url?: string;
  order?: number;
  parent_id?: string | null;
  status?: 'active' | 'inactive';
  children?: Menu[];
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  code: string;
  message: string;
  data: T;
}

interface PaginatedData {
  menus: Menu[];
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
    per_page: number;
    to: number;
    total: number;
  };
}

const getMenuConfig = () => {
  const config = getApiConfig();
  return {
    baseURL: config.apiBaseUrl,
    endpoints: {
      list: '/admin/menus',
      create: '/admin/menus',
      show: '/admin/menus',
      update: '/admin/menus',
      delete: '/admin/menus',
    },
  };
};

export const menuService = {
  /**
   * Get all menus
   */
  async getMenus(params?: {
    parent_id?: string | null;
    search?: string;
    status?: 'active' | 'inactive';
    with_hierarchy?: boolean;
  }): Promise<Menu[]> {
    const config = getMenuConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.parent_id !== undefined) {
      queryParams.append('parent_id', params.parent_id || 'null');
    }
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.with_hierarchy) queryParams.append('with_hierarchy', 'true');

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
      throw new Error(errorData.message || 'Failed to fetch menus');
    }

    const result: ApiResponse<PaginatedData> = await response.json();
    return result.data.menus;
  },

  /**
   * Get a single menu by ID
   */
  async getMenu(id: string): Promise<Menu> {
    const config = getMenuConfig();
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
      throw new Error(errorData.message || 'Failed to fetch menu');
    }

    const result: ApiResponse<{ menu: Menu }> = await response.json();
    return result.data.menu;
  },
};
