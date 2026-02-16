import { getApiConfig } from './apiService';

export interface Menu {
  id: string;
  name: string;
  url: string | null;
  target: '_self' | '_blank' | null;
  parent_id: string | null;
  parent?: Menu | null;
  order: number;
  status: 'active' | 'inactive';
  children?: Menu[];
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
      reorder: '/admin/menus/reorder',
    },
  };
};

export interface PaginatedResponse {
  menus: Menu[];
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

export const menuService = {
  /**
   * Get all menus with pagination
   */
  async getMenus(params?: {
    status?: 'active' | 'inactive';
    search?: string;
    page?: number;
    limit?: number;
    parent_id?: string | null;
    with_hierarchy?: boolean;
  }): Promise<PaginatedResponse> {
    const config = getMenuConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.parent_id !== undefined) {
      queryParams.append('parent_id', params.parent_id || 'null');
    }
    if (params?.with_hierarchy) {
      queryParams.append('with_hierarchy', 'true');
    }

    const url = `${config.baseURL}${config.endpoints.list}?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error fetching menus: ${response.statusText}`
      );
    }

    const result: ApiResponse<PaginatedData> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch menus');
    }

    return {
      menus: result.data.menus || [],
      meta: result.data.meta,
      links: result.data.links,
    };
  },

  /**
   * Get all menus without pagination (for forms, dropdowns, etc.)
   */
  async getAllMenus(params?: {
    status?: 'active' | 'inactive';
  }): Promise<Menu[]> {
    const config = getMenuConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    const url = `${config.baseURL}${config.endpoints.list}/all?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error fetching all menus: ${response.statusText}`
      );
    }

    const result: ApiResponse<{ menus: Menu[] }> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch all menus');
    }

    return result.data.menus || [];
  },

  /**
   * Get a single menu by ID
   */
  async getMenu(id: number | string): Promise<Menu> {
    const config = getMenuConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${config.baseURL}${config.endpoints.show}/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error fetching menu: ${response.statusText}`
      );
    }

    const result: ApiResponse<{ menu: Menu }> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch menu');
    }

    return result.data.menu;
  },

  /**
   * Create a new menu
   */
  async createMenu(menuData: {
    name: string;
    url?: string | null;
    target?: '_self' | '_blank' | null;
    parent_id?: string | null;
    order?: number | null;
    status: 'active' | 'inactive';
  }): Promise<Menu> {
    const config = getMenuConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${config.baseURL}${config.endpoints.create}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(menuData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error creating menu: ${response.statusText}`
      );
    }

    const result: ApiResponse<{ menu: Menu }> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to create menu');
    }

    return result.data.menu;
  },

  /**
   * Update an existing menu
   */
  async updateMenu(
    id: number | string,
    menuData: {
      name?: string;
      url?: string | null;
      target?: '_self' | '_blank' | null;
      parent_id?: string | null;
      order?: number | null;
      status?: 'active' | 'inactive';
    }
  ): Promise<Menu> {
    const config = getMenuConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${config.baseURL}${config.endpoints.update}/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(menuData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error updating menu: ${response.statusText}`
      );
    }

    const result: ApiResponse<{ menu: Menu }> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to update menu');
    }

    return result.data.menu;
  },

  /**
   * Delete a menu
   */
  async deleteMenu(id: number | string): Promise<void> {
    const config = getMenuConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${config.baseURL}${config.endpoints.delete}/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error deleting menu: ${response.statusText}`
      );
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to delete menu');
    }
  },

  /**
   * Reorder menus
   */
  async reorderMenus(
    menuData: Array<{ id: string; parent_id: string | null; order: number }>
  ): Promise<void> {
    const config = getMenuConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${config.baseURL}${config.endpoints.reorder}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(menuData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error reordering menus: ${response.statusText}`
      );
    }

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to reorder menus');
    }
  },
};
