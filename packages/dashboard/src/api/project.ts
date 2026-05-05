import apiClient from './client';

export const projectApi = {
  getProjects: async () => {
    const response = await apiClient.get('/api/v1/projects');
    return response.data;
  },

  getProject: async (id: string) => {
    const response = await apiClient.get(`/api/v1/projects/${id}`);
    return response.data;
  },

  createProject: async (data: { name: string }) => {
    const response = await apiClient.post('/api/v1/projects', data);
    return response.data;
  },
};
