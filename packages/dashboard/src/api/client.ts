/**
 * Axios HTTP Client Configuration
 * 
 * @description_zh Axios HTTP 客户端配置
 * @description_en Axios HTTP client configuration
 * @description_ja Axios HTTPクライアント設定
 * @description_tw Axios HTTP 客戶端配置
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

/**
 * API Response Interface
 * 
 * @description_zh API 响应接口
 * @description_en API response interface
 * @description_ja APIレスポンスインターフェース
 * @description_tw API 回應介面
 */
interface ApiResponse<T = any> {
  data: T;
  meta?: {
    timestamp?: number;
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * API Error Interface
 * 
 * @description_zh API 错误接口
 * @description_en API error interface
 * @description_ja APIエラーインターフェース
 * @description_tw API 錯誤介面
 */
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

/**
 * Create axios instance with default configuration
 * 
 * @description_zh 创建带有默认配置的 axios 实例
 * @description_en Create axios instance with default configuration
 * @description_ja デフォルト設定でaxiosインスタンスを作成
 * @description_tw 建立帶有預設配置的 axios 實例
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add API key for certain endpoints
      if (config.url?.includes('/report')) {
        const apiKey = localStorage.getItem('api_key');
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      return response;
    },
    (error) => {
      // Handle common errors
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }

      if (error.response?.status === 403) {
        // Forbidden - show error message
        console.error('Access denied');
      }

      if (error.response?.status >= 500) {
        // Server error - show generic error
        console.error('Server error occurred');
      }

      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Default API client instance
 * 
 * @description_zh 默认 API 客户端实例
 * @description_en Default API client instance
 * @description_ja デフォルトAPIクライアントインスタンス
 * @description_tw 預設 API 客戶端實例
 */
export const apiClient = createApiClient();

/**
 * Generic API request function with type safety
 * 
 * @description_zh 带类型安全的通用 API 请求函数
 * @description_en Generic API request function with type safety
 * @description_ja 型安全性を持つ汎用APIリクエスト関数
 * @description_tw 帶類型安全的通用 API 請求函數
 */
export const request = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data.data;
};

export type { ApiResponse, ApiError };