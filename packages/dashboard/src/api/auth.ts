import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post('/api/v1/auth/login', data);
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/api/v1/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/v1/auth/me');
    return response.data;
  },
};
