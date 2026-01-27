import { getApiConfig } from './apiService';
import { Role, MenuPermission } from './roleService';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  role?: Role;
  role_id?: string | null;
  status: 'active' | 'inactive';
  permissions?: MenuPermission[];
  email_verified_at?: string | null;
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
  users: User[];
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

const getUserConfig = () => {
  const config = getApiConfig();
  return {
    baseURL: config.apiBaseUrl,
    endpoints: {
      list: '/admin/users',
      create: '/admin/users',
      show: '/admin/users',
      update: '/admin/users',
      delete: '/admin/users',
    },
  };
};

export interface PaginatedResponse {
  users: User[];
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

export const userService = {
  /**
   * Get all users with pagination
   */
  async getUsers(params?: {
    status?: 'active' | 'inactive';
    search?: string;
    page?: number;
    limit?: number;
    role_id?: string;
  }): Promise<PaginatedResponse> {
    const config = getUserConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role_id) queryParams.append('role_id', params.role_id);

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
      throw new Error(errorData.message || 'Failed to fetch users');
    }

    const result: ApiResponse<PaginatedData> = await response.json();
    return result.data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: number): Promise<User> {
    const config = getUserConfig();
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
      throw new Error(errorData.message || 'Failed to fetch user');
    }

    const result: ApiResponse<{ user: User }> = await response.json();
    return result.data.user;
  },

  /**
   * Create a new user
   */
  async createUser(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id?: string | null;
    status?: 'active' | 'inactive';
    menus?: MenuPermission[];
    avatar?: File | null;
  }): Promise<User> {
    const config = getUserConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    let body: FormData | string;
    let headers: Record<string, string>;

    // Si hay avatar, usar FormData
    if (userData.avatar) {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('username', userData.username);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('password_confirmation', userData.password_confirmation);
      if (userData.role_id) formData.append('role_id', userData.role_id);
      if (userData.status) formData.append('status', userData.status);
      if (userData.menus) formData.append('menus', JSON.stringify(userData.menus));
      formData.append('avatar', userData.avatar);

      body = formData;
      headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };
    } else {
      // Sin avatar, usar JSON
      body = JSON.stringify(userData);
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.create}`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }

    const result: ApiResponse<{ user: User }> = await response.json();
    return result.data.user;
  },

  /**
   * Update an existing user
   */
  async updateUser(
    id: number,
    userData: {
      name?: string;
      username?: string;
      email?: string;
      password?: string;
      password_confirmation?: string;
      role_id?: string | null;
      status?: 'active' | 'inactive';
      menus?: MenuPermission[];
      avatar?: File | null;
    }
  ): Promise<User> {
    const config = getUserConfig();
    const token = localStorage.getItem('emibytes_auth_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    let body: FormData | string;
    let headers: Record<string, string>;
    let method = 'PUT';

    // Si hay avatar, usar FormData con POST y _method
    if (userData.avatar) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      if (userData.name) formData.append('name', userData.name);
      if (userData.username) formData.append('username', userData.username);
      if (userData.email) formData.append('email', userData.email);
      if (userData.password) {
        formData.append('password', userData.password);
        formData.append('password_confirmation', userData.password_confirmation!);
      }
      if (userData.role_id !== undefined) formData.append('role_id', userData.role_id || '');
      if (userData.status) formData.append('status', userData.status);
      if (userData.menus) formData.append('menus', JSON.stringify(userData.menus));
      formData.append('avatar', userData.avatar);

      body = formData;
      method = 'POST';
      headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };
    } else {
      // Sin avatar, usar JSON con PUT
      body = JSON.stringify(userData);
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };
    }

    const response = await fetch(`${config.baseURL}${config.endpoints.update}/${id}`, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }

    const result: ApiResponse<{ user: User }> = await response.json();
    return result.data.user;
  },

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<void> {
    const config = getUserConfig();
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
      throw new Error(errorData.message || 'Failed to delete user');
    }
  },

  /**
   * Get all users (legacy method for compatibility)
   */
  async getAllUsers(): Promise<User[]> {
    const data = await this.getUsers({ limit: 100 });
    return data.users;
  },
};

