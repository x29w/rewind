/**
 * Redux Store 配置
 * Redux Store Configuration
 * Redux ストア設定
 * Redux Store 配置
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
import projectReducer from './project.slice';
import issueReducer from './issue.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    issue: issueReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
