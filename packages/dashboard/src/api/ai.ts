import apiClient from './client';

export const aiApi = {
  analyzeIssue: async (issueId: string) => {
    const response = await apiClient.post(`/api/v1/ai/analyze/${issueId}`);
    return response.data;
  },

  getAnalysis: async (issueId: string) => {
    const response = await apiClient.get(`/api/v1/ai/analysis/${issueId}`);
    return response.data;
  },

  findSimilar: async (issueId: string) => {
    const response = await apiClient.post(`/api/v1/ai/similar/${issueId}`);
    return response.data;
  },
};
