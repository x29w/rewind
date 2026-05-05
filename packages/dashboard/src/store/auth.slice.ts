/**
 * 认证 Store
 * Auth Store
 * 認証ストア
 * 認證 Store
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loginService, registerService, getCurrentUserService } from '../api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

/**
 * 登录
 * Login
 * ログイン
 * 登入
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await loginService({ data: { email, password } });
    localStorage.setItem('token', response.token);
    return response;
  },
);

/**
 * 注册
 * Register
 * 登録
 * 註冊
 */
export const register = createAsyncThunk(
  'auth/register',
  async ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) => {
    const response = await registerService({ data: { email, password, name } });
    localStorage.setItem('token', response.token);
    return response;
  },
);

/**
 * 获取当前用户
 * Get Current User
 * 現在のユーザーを取得
 * 取得目前使用者
 */
export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  const response = await getCurrentUserService();
  return response;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Login failed';
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Registration failed';
    });

    // Get Current User
    builder.addCase(getCurrentUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
