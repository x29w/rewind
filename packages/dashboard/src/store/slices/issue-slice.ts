/**
 * Issue Slice
 * Issue スライス
 * Issue Slice
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: IssueState = {
  issues: [],
  currentIssue: null,
  loading: false,
  total: 0,
  page: 1,
  pageSize: 20,
};

const issueSlice = createSlice({
  name: 'issue',
  initialState,
  reducers: {
    setIssues: (state, action: PayloadAction<{ issues: Issue[]; total: number }>) => {
      state.issues = action.payload.issues;
      state.total = action.payload.total;
    },
    setCurrentIssue: (state, action: PayloadAction<Issue>) => {
      state.currentIssue = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setIssues, setCurrentIssue, setPage, setLoading } = issueSlice.actions;
export default issueSlice.reducer;
