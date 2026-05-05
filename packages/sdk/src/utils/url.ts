/**
 * URL 工具函数
 * URL Utility Functions
 * URL ユーティリティ関数
 * URL 工具函數
 */

/**
 * 敏感参数列表
 * Sensitive parameter list
 * 機密パラメータリスト
 * 敏感參數列表
 */
const SENSITIVE_KEYS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'api_key',
  'apikey',
  'access_token',
  'auth',
  'credentials',
  'mysql_pwd',
  'stripetoken',
  'card',
  'cvv',
  'ssn',
  'credit',
];

/**
 * Sanitize URL by removing sensitive query parameters
 * 
 * @description_zh 通过移除敏感查询参数来脱敏 URL
 * @description_en Sanitize URL by removing sensitive query parameters
 * @description_ja 機密なクエリパラメータを削除してURLをサニタイズ
 * @description_tw 透過移除敏感查詢參數來脫敏 URL
 * @param url - 原始 URL / Original URL / 元のURL / 原始 URL
 * @returns 脱敏后的 URL / Sanitized URL / サニタイズされた URL / 脫敏後的 URL
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // 遍历查询参数，移除敏感信息
    // Iterate query parameters, remove sensitive info
    // クエリパラメータを反復処理し、機密情報を削除
    // 遍歷查詢參數，移除敏感資訊
    urlObj.searchParams.forEach((value, key) => {
      if (isSensitiveKey(key)) {
        urlObj.searchParams.set(key, '[FILTERED]');
      }
    });
    
    return urlObj.toString();
  } catch (error) {
    // 如果不是有效的 URL，直接返回
    // If not a valid URL, return as is
    // 有効な URL でない場合、そのまま返す
    // 如果不是有效的 URL，直接返回
    return url;
  }
}

/**
 * Check if a query parameter key is sensitive
 * 
 * @description_zh 检查查询参数键是否敏感
 * @description_en Check if a query parameter key is sensitive
 * @description_ja クエリパラメータキーが機密かどうかをチェック
 * @description_tw 檢查查詢參數鍵是否敏感
 * @param key - 参数键 / Parameter key / パラメータキー / 參數鍵
 * @returns 是否敏感 / Is sensitive / 機密かどうか / 是否敏感
 */
const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey));
}

/**
 * Get pathname from URL
 * 
 * @description_zh 从 URL 中获取路径名
 * @description_en Get pathname from URL
 * @description_ja URLからパス名を取得
 * @description_tw 從 URL 中取得路徑名
 * @param url - URL 字符串 / URL string / URL文字列 / URL 字串
 * @returns 路径名 / Pathname / パス名 / 路徑名
 */
export const getPathname = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (error) {
    // 如果解析失败，尝试提取路径部分
    // If parsing fails, try to extract path part
    // 解析に失敗した場合、パス部分を抽出
    // 如果解析失敗，嘗試提取路徑部分
    const match = url.match(/^[^?#]*/);
    return match ? match[0] : url;
  }
}

/**
 * Get domain from URL
 * 
 * @description_zh 从 URL 中获取域名
 * @description_en Get domain from URL
 * @description_ja URLからドメインを取得
 * @description_tw 從 URL 中取得域名
 * @param url - URL 字符串 / URL string / URL文字列 / URL 字串
 * @returns 域名 / Domain / ドメイン / 域名
 */
export const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return '';
  }
}
