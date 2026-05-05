/**
 * 项目 Slice
 * Project Slice
 * プロジェクトスライス
 * 專案 Slice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Project {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
      localStorage.setItem('currentProjectId', action.payload.id);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setProjects, setCurrentProject, setLoading } = projectSlice.actions;
export default projectSlice.reducer;
