/**
 * 设备信息工具函数
 * Device Information Utility Functions
 * デバイス情報ユーティリティ関数
 * 裝置資訊工具函數
 */

import type { DeviceInfo, NetworkInfo } from '@rewind-dev/shared';

/**
 * 获取设备信息
 * Get device information
 * デバイス情報を取得
 * 獲取裝置資訊
 * 
 * @description_zh 获取完整的设备信息，包括浏览器、操作系统、屏幕尺寸等
 * @description_en Get complete device information including browser, OS, screen dimensions, etc.
 * @description_ja ブラウザ、OS、画面サイズなどを含む完全なデバイス情報を取得
 * @description_tw 獲取完整的裝置資訊，包括瀏覽器、作業系統、螢幕尺寸等
 * 
 * @returns 设备信息对象 / Device information object / デバイス情報オブジェクト / 裝置資訊物件
 */
export const getDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent;
  
  return {
    userAgent: ua,
    browser: getBrowserName({ ua }),
    browserVersion: getBrowserVersion({ ua }),
    os: getOSName({ ua }),
    osVersion: getOSVersion({ ua }),
    deviceType: getDeviceType({ ua }),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

/**
 * 获取浏览器名称
 * Get browser name
 * ブラウザ名を取得
 * 獲取瀏覽器名稱
 * 
 * @description_zh 从用户代理字符串中识别浏览器名称
 * @description_en Identify browser name from user agent string
 * @description_ja ユーザーエージェント文字列からブラウザ名を識別
 * @description_tw 從使用者代理字串中識別瀏覽器名稱
 */
const getBrowserName = (params: Utils.GetBrowserNameParams): string => {
  const { ua } = params;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';
  return 'Unknown';
};

/**
 * 获取浏览器版本
 * Get browser version
 * ブラウザバージョンを取得
 * 獲取瀏覽器版本
 * 
 * @description_zh 从用户代理字符串中提取浏览器版本号
 * @description_en Extract browser version number from user agent string
 * @description_ja ユーザーエージェント文字列からブラウザバージョン番号を抽出
 * @description_tw 從使用者代理字串中提取瀏覽器版本號
 */
const getBrowserVersion = (params: Utils.GetBrowserVersionParams): string => {
  const { ua } = params;
  const patterns = [
    /Firefox\/(\d+\.\d+)/,
    /Edg\/(\d+\.\d+)/,
    /Chrome\/(\d+\.\d+)/,
    /Version\/(\d+\.\d+).*Safari/,
    /Opera\/(\d+\.\d+)/,
    /OPR\/(\d+\.\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = ua.match(pattern);
    if (match) return match[1];
  }
  
  return 'Unknown';
};

/**
 * 获取操作系统名称
 * Get OS name
 * OS 名を取得
 * 獲取作業系統名稱
 * 
 * @description_zh 从用户代理字符串中识别操作系统名称
 * @description_en Identify operating system name from user agent string
 * @description_ja ユーザーエージェント文字列からオペレーティングシステム名を識別
 * @description_tw 從使用者代理字串中識別作業系統名稱
 */
const getOSName = (params: Utils.GetOSNameParams): string => {
  const { ua } = params;
  if (ua.includes('Windows NT')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
};

/**
 * 获取操作系统版本
 * Get OS version
 * OS バージョンを取得
 * 獲取作業系統版本
 * 
 * @description_zh 从用户代理字符串中提取操作系统版本号
 * @description_en Extract operating system version number from user agent string
 * @description_ja ユーザーエージェント文字列からオペレーティングシステムのバージョン番号を抽出
 * @description_tw 從使用者代理字串中提取作業系統版本號
 */
const getOSVersion = (params: Utils.GetOSVersionParams): string => {
  const { ua } = params;
  const patterns = [
    /Windows NT (\d+\.\d+)/,
    /Mac OS X (\d+[._]\d+[._]\d+)/,
    /Android (\d+\.\d+)/,
    /OS (\d+_\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = ua.match(pattern);
    if (match) return match[1].replace(/_/g, '.');
  }
  
  return 'Unknown';
};

/**
 * 获取设备类型
 * Get device type
 * デバイスタイプを取得
 * 獲取裝置類型
 * 
 * @description_zh 根据用户代理字符串判断设备类型（桌面、移动、平板）
 * @description_en Determine device type (desktop, mobile, tablet) based on user agent string
 * @description_ja ユーザーエージェント文字列に基づいてデバイスタイプ（デスクトップ、モバイル、タブレット）を判定
 * @description_tw 根據使用者代理字串判斷裝置類型（桌面、行動、平板）
 */
const getDeviceType = (params: Utils.GetDeviceTypeParams): 'desktop' | 'mobile' | 'tablet' => {
  const { ua } = params;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * 获取网络信息
 * Get network information
 * ネットワーク情報を取得
 * 獲取網路資訊
 * 
 * @description_zh 获取网络连接信息，包括连接类型、下载速度、延迟等
 * @description_en Get network connection information including connection type, download speed, latency, etc.
 * @description_ja 接続タイプ、ダウンロード速度、レイテンシなどのネットワーク接続情報を取得
 * @description_tw 獲取網路連線資訊，包括連線類型、下載速度、延遲等
 * 
 * @returns 网络信息对象 / Network information object / ネットワーク情報オブジェクト / 網路資訊物件
 */
export const getNetworkInfo = (): NetworkInfo => {
  // @ts-ignore - NetworkInformation API 可能不存在 / may not exist / 存在しない可能性 / 可能不存在
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return {};
  }
  
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
};
