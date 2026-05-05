/**
 * Issue Store
 * Issue ストア
 * Issue Store
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getIssuesService,
  getIssueService,
  updateIssueStatusService,
} from '../api/issue';

interface Issue {
  id: string;
  fingerprint: string;
  type: string;
  level: string;
  status: string;
  title: string;
  message: string;
  eventCount: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  appVersion?: string;
  environment?: string;
  aiSummary?: string;
}

interface IssueState {
  issues: Issue[];
  currentIssue: any | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: IssueState = {
  issues: [],
  currentIssue: null,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
};

/**
 * 获取 Issue 列表
 * Get Issues
 * Issue リストを取得
 * 取得 Issue 列表
 */
export const fetchIssues = createAsyncThunk(
  'issue/fetchIssues',
  async ({
    projectId,
    params,
  }: {
    projectId: string;
    params?: Record<string, any>;
  }) => {
    const response = await getIssuesService({ projectId, params });
    return response;
  },
);

/**
 * 获取 Issue 详情
 * Get Issue Detail
 * Issue 詳細を取得
 * 取得 Issue 詳情
 */
export const fetchIssue = createAsyncThunk(
  'issue/fetchIssue',
  async ({ projectId, issueId }: { projectId: string; issueId: string }) => {
    const response = await getIssueService({ projectId, issueId });
    return response;
  },
);

/**
 * 更新 Issue 状态
 * Update Issue Status
 * Issue ステータスを更新
 * 更新 Issue 狀態
 */
export const updateIssueStatus = createAsyncThunk(
  'issue/updateStatus',
  async ({
    projectId,
    issueId,
    status,
  }: {
    projectId: string;
    issueId: string;
    status: string;
  }) => {
    const response = await updateIssueStatusService({
      projectId,
      issueId,
      data: { status },
    });
    return response;
  },
);

const issueSlice = createSlice({
  name: 'issue',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Issues
    builder.addCase(fetchIssues.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchIssues.fulfilled, (state, action) => {
      state.loading = false;
      state.issues = action.payload;
    });
    builder.addCase(fetchIssues.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch issues';
    });

    // Fetch Issue
    builder.addCase(fetchIssue.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchIssue.fulfilled, (state, action) => {
      state.loading = false;
      state.currentIssue = action.payload;
    });
    builder.addCase(fetchIssue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch issue';
    });

    // Update Status
    builder.addCase(updateIssueStatus.fulfilled, (state, action) => {
      const index = state.issues.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = { ...state.issues[index], ...action.payload };
      }
      if (state.currentIssue?.id === action.payload.id) {
        state.currentIssue = { ...state.currentIssue, ...action.payload };
      }
    });
  },
});

export const { clearError, setPage } = issueSlice.actions;
export default issueSlice.reducer;
