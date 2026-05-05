import { request } from './client';

/**
 * 认证相关 API
 * Authentication Related APIs
 * 認証関連API
 * 認證相關 API
 */

/**
 * 用户登录
 * 
 * @description_zh 用户登录服务
 * @description_en User login service
 * @description_ja ユーザーログインサービス
 * @description_tw 使用者登入服務
 */
export const loginService = async (params: Auth.LoginParams): Promise<Auth.LoginResponse> => {
  return request<Auth.LoginResponse>({
    method: 'POST',
    url: '/auth/login',
    data: params.data,
  });
};

/**
 * User logout
 * 
 * @description_zh 用户登出服务
 * @description_en User logout service
 * @description_ja ユーザーログアウトサービス
 * @description_tw 使用者登出服務
 */
export const logoutService = async (): Promise<void> => {
  return request<void>({
    method: 'POST',
    url: '/auth/logout',
  });
};

/**
 * Get current user info
 * 
 * @description_zh 获取当前用户信息服务
 * @description_en Get current user info service
 * @description_ja 現在のユーザー情報取得サービス
 * @description_tw 取得目前使用者資訊服務
 */
export const getCurrentUserService = async (): Promise<Auth.LoginResponse['user']> => {
  return request<Auth.LoginResponse['user']>({
    method: 'GET',
    url: '/auth/me',
  });
};

/**
 * User registration
 * 
 * @description_zh 用户注册服务
 * @description_en User registration service
 * @description_ja ユーザー登録サービス
 * @description_tw 使用者註冊服務
 */
export const registerService = async (params: Auth.RegisterParams): Promise<Auth.LoginResponse> => {
  return request<Auth.LoginResponse>({
    method: 'POST',
    url: '/auth/register',
    data: params.data,
  });
};
