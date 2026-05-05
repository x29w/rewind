import apiClient from './client';

export const issueApi = {
  getIssues: async (projectId: string, params: any = {}) => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/issues`, { params });
    return response.data;
  },

  getIssue: async (projectId: string, issueId: string) => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/issues/${issueId}`);
    return response.data;
  },

  updateIssueStatus: async (projectId: string, issueId: string, status: string) => {
    const response = await apiClient.patch(`/api/v1/projects/${projectId}/issues/${issueId}`, { status });
    return response.data;
  },
};
