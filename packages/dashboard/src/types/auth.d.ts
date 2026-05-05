/**
 * 认证相关类型定义
 * Authentication Related Type Definitions
 * 認証関連タイプ定義
 * 認證相關類型定義
 */

declare namespace Auth {
  /**
   * 登录请求参数
   * @description_zh 用户登录时需要的参数
   * @description_en Parameters required for user login
   * @description_ja ユーザーログインに必要なパラメータ
   * @description_tw 使用者登入時需要的參數
   */
  interface LoginParams {
    data: {
      email: string;
      password: string;
    };
  }

  /**
   * 注册请求参数
   * @description_zh 用户注册时需要的参数
   * @description_en Parameters required for user registration
   * @description_ja ユーザー登録に必要なパラメータ
   * @description_tw 使用者註冊時需要的參數
   */
  interface RegisterParams {
    data: {
      email: string;
      password: string;
      name: string;
    };
  }

  /**
   * 登录响应数据
   * @description_zh 登录成功后返回的数据
   * @description_en Data returned after successful login
   * @description_ja ログイン成功後に返されるデータ
   * @description_tw 登入成功後返回的資料
   */
  interface LoginResponse {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}