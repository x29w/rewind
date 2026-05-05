/**
 * 项目 Store
 * Project Store
 * プロジェクトストア
 * 專案 Store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getProjectsService,
  getProjectService,
  createProjectService,
} from '../api/project';

interface Project {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  createdAt: string;
  _count?: {
    issues: number;
    events: number;
  };
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

/**
 * 获取项目列表
 * Get Projects
 * プロジェクトリストを取得
 * 取得專案列表
 */
export const fetchProjects = createAsyncThunk('project/fetchProjects', async () => {
  const response = await getProjectsService({});
  return response;
});

/**
 * 获取项目详情
 * Get Project Detail
 * プロジェクト詳細を取得
 * 取得專案詳情
 */
export const fetchProject = createAsyncThunk(
  'project/fetchProject',
  async (projectId: string) => {
    const response = await getProjectService({ id: projectId });
    return response;
  },
);

/**
 * 创建项目
 * Create Project
 * プロジェクトを作成
 * 建立專案
 */
export const createProject = createAsyncThunk(
  'project/createProject',
  async (data: { name: string; description?: string }) => {
    const response = await createProjectService({ data });
    return response;
  },
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload;
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch projects';
    });

    // Fetch Project
    builder.addCase(fetchProject.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProject.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
    });
    builder.addCase(fetchProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch project';
    });

    // Create Project
    builder.addCase(createProject.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createProject.fulfilled, (state, action) => {
      state.loading = false;
      state.projects.push(action.payload);
    });
    builder.addCase(createProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create project';
    });
  },
});

export const { setCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
