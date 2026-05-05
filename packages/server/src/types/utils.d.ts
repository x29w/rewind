/**
 * Server 工具函数类型定义
 * Server Utility Functions Type Definitions
 * Server ユーティリティ関数タイプ定義
 * Server 工具函數類型定義
 */

declare namespace Utils {
  /**
   * 哈希参数
   * @description_zh 生成哈希值时需要的参数
   * @description_en Parameters required for generating hash
   * @description_ja ハッシュ生成に必要なパラメータ
   * @description_tw 生成雜湊值時需要的參數
   */
  interface HashParams {
    data: string;
    algorithm?: string;
  }

  /**
   * 加密参数
   * @description_zh 加密数据时需要的参数
   * @description_en Parameters required for encrypting data
   * @description_ja データ暗号化に必要なパラメータ
   * @description_tw 加密資料時需要的參數
   */
  interface EncryptParams {
    data: string;
    key: string;
  }

  /**
   * 解密参数
   * @description_zh 解密数据时需要的参数
   * @description_en Parameters required for decrypting data
   * @description_ja データ復号化に必要なパラメータ
   * @description_tw 解密資料時需要的參數
   */
  interface DecryptParams {
    encryptedData: string;
    key: string;
  }

  /**
   * 邮箱验证参数
   * @description_zh 验证邮箱格式时需要的参数
   * @description_en Parameters required for validating email format
   * @description_ja メール形式検証に必要なパラメータ
   * @description_tw 驗證郵箱格式時需要的參數
   */
  interface ValidateEmailParams {
    email: string;
  }

  /**
   * 生成令牌参数
   * @description_zh 生成JWT令牌时需要的参数
   * @description_en Parameters required for generating JWT token
   * @description_ja JWTトークン生成に必要なパラメータ
   * @description_tw 生成JWT令牌時需要的參數
   */
  interface GenerateTokenParams {
    payload: Record<string, any>;
    secret: string;
    expiresIn?: string;
  }

  /**
   * 验证令牌参数
   * @description_zh 验证JWT令牌时需要的参数
   * @description_en Parameters required for verifying JWT token
   * @description_ja JWTトークン検証に必要なパラメータ
   * @description_tw 驗證JWT令牌時需要的參數
   */
  interface VerifyTokenParams {
    token: string;
    secret: string;
  }
}