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
 * URL 脱敏
 * Sanitize URL
 * URL をサニタイズ
 * URL 脫敏
 * 
 * @param url - 原始 URL / Original URL / 元の URL / 原始 URL
 * @returns 脱敏后的 URL / Sanitized URL / サニタイズされた URL / 脫敏後的 URL
 */
export function sanitizeUrl(url: string): string {
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
 * 检查是否为敏感键名
 * Check if key is sensitive
 * キーが機密かどうかを確認
 * 檢查是否為敏感鍵名
 * 
 * @param key - 键名 / Key name / キー名 / 鍵名
 * @returns 是否敏感 / Is sensitive / 機密かどうか / 是否敏感
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey));
}

/**
 * 从 URL 中提取路径名
 * Extract pathname from URL
 * URL からパス名を抽出
 * 從 URL 中提取路徑名
 * 
 * @param url - URL 字符串 / URL string / URL 文字列 / URL 字串
 * @returns 路径名 / Pathname / パス名 / 路徑名
 */
export function getPathname(url: string): string {
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
 * 获取 URL 的域名
 * Get domain from URL
 * URL のドメインを取得
 * 獲取 URL 的域名
 * 
 * @param url - URL 字符串 / URL string / URL 文字列 / URL 字串
 * @returns 域名 / Domain / ドメイン / 域名
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return '';
  }
}
