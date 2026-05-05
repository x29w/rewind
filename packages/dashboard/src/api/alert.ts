import apiClient from './client';

export const alertApi = {
  testAlert: async (channel: string) => {
    const response = await apiClient.post('/api/v1/alerts/test', { channel });
    return response.data;
  },

  triggerAlert: async (issueId: string) => {
    const response = await apiClient.post(`/api/v1/alerts/trigger/${issueId}`);
    return response.data;
  },
};
