import { apiService } from './apiService';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role_id?: number;
  status?: string;
}

interface UsersResponse {
  users: User[];
  links?: any;
  meta?: any;
}

class UserService {
  private baseUrl = '/admin/users';

  async getUsers(params?: { search?: string; status?: string; limit?: number }): Promise<User[]> {
    try {
      const queryParams: Record<string, string> = {};
      
      if (params?.search) queryParams.search = params.search;
      if (params?.status) queryParams.status = params.status;
      if (params?.limit) queryParams.limit = params.limit.toString();
      
      const response = await apiService.getList<UsersResponse>(this.baseUrl, queryParams);
      
      return response.data.users || [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.getUsers({ limit: 100 });
  }
}

export const userService = new UserService();
