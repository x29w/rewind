/**
 * Redux Store 配置
 * Redux Store Configuration
 * Redux Store 設定
 * Redux Store 配置
 */

import { configureStore } from '@reduxjs/toolkit';

/**
 * Redux Store
 */
export const store = configureStore({
  reducer: {
    // TODO: Add reducers
  },
});

/**
 * RootState 类型
 * RootState Type
 * RootState タイプ
 * RootState 類型
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch 类型
 * AppDispatch Type
 * AppDispatch タイプ
 * AppDispatch 類型
 */
export type AppDispatch = typeof store.dispatch;
