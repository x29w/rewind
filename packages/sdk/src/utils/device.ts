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
 * @returns 设备信息对象 / Device information object / デバイス情報オブジェクト / 裝置資訊物件
 */
export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  
  return {
    userAgent: ua,
    browser: getBrowserName(ua),
    browserVersion: getBrowserVersion(ua),
    os: getOSName(ua),
    osVersion: getOSVersion(ua),
    deviceType: getDeviceType(ua),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/**
 * 获取浏览器名称
 * Get browser name
 * ブラウザ名を取得
 * 獲取瀏覽器名稱
 */
function getBrowserName(ua: string): string {
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';
  return 'Unknown';
}

/**
 * 获取浏览器版本
 * Get browser version
 * ブラウザバージョンを取得
 * 獲取瀏覽器版本
 */
function getBrowserVersion(ua: string): string {
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
}

/**
 * 获取操作系统名称
 * Get OS name
 * OS 名を取得
 * 獲取作業系統名稱
 */
function getOSName(ua: string): string {
  if (ua.includes('Windows NT')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

/**
 * 获取操作系统版本
 * Get OS version
 * OS バージョンを取得
 * 獲取作業系統版本
 */
function getOSVersion(ua: string): string {
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
}

/**
 * 获取设备类型
 * Get device type
 * デバイスタイプを取得
 * 獲取裝置類型
 */
function getDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * 获取网络信息
 * Get network information
 * ネットワーク情報を取得
 * 獲取網路資訊
 * 
 * @returns 网络信息对象 / Network information object / ネットワーク情報オブジェクト / 網路資訊物件
 */
export function getNetworkInfo(): NetworkInfo {
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
}
