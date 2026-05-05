import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice.ts';
import projectReducer from './slices/project-slice.ts';
import issueReducer from './slices/issue-slice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    issue: issueReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
