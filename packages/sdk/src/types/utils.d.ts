/**
 * SDK 工具函数相关类型定义
 * SDK Utility Functions Related Type Definitions
 * SDK ユーティリティ関数関連タイプ定義
 * SDK 工具函數相關類型定義
 */

declare namespace Utils {
  /**
   * 获取元素路径参数
   * @description_zh 获取HTML元素路径时需要的参数
   * @description_en Parameters required for getting HTML element path
   * @description_ja HTML要素パス取得に必要なパラメータ
   * @description_tw 獲取HTML元素路徑時需要的參數
   */
  interface GetElementPathParams {
    element: HTMLElement;
  }

  /**
   * 获取元素文本参数
   * @description_zh 获取HTML元素文本时需要的参数
   * @description_en Parameters required for getting HTML element text
   * @description_ja HTML要素テキスト取得に必要なパラメータ
   * @description_tw 獲取HTML元素文字時需要的參數
   */
  interface GetElementTextParams {
    element: HTMLElement;
    maxLength?: number;
  }

  /**
   * 获取元素选择器参数
   * @description_zh 获取HTML元素选择器时需要的参数
   * @description_en Parameters required for getting HTML element selector
   * @description_ja HTML要素セレクタ取得に必要なパラメータ
   * @description_tw 獲取HTML元素選擇器時需要的參數
   */
  interface GetElementSelectorParams {
    element: HTMLElement;
    maxDepth?: number;
  }

  /**
   * 检查元素可见性参数
   * @description_zh 检查HTML元素可见性时需要的参数
   * @description_en Parameters required for checking HTML element visibility
   * @description_ja HTML要素の可視性確認に必要なパラメータ
   * @description_tw 檢查HTML元素可見性時需要的參數
   */
  interface IsElementVisibleParams {
    element: HTMLElement;
  }

  /**
   * 节流函数参数
   * @description_zh 创建节流函数时需要的参数
   * @description_en Parameters required for creating throttle function
   * @description_ja スロットル関数作成に必要なパラメータ
   * @description_tw 建立節流函數時需要的參數
   */
  interface ThrottleParams<T extends (...args: any[]) => any> {
    fn: T;
    delay: number;
  }

  /**
   * 防抖函数参数
   * @description_zh 创建防抖函数时需要的参数
   * @description_en Parameters required for creating debounce function
   * @description_ja デバウンス関数作成に必要なパラメータ
   * @description_tw 建立防抖函數時需要的參數
   */
  interface DebounceParams<T extends (...args: any[]) => any> {
    fn: T;
    delay: number;
  }

  /**
   * 安全执行函数参数
   * @description_zh 安全执行函数时需要的参数
   * @description_en Parameters required for safe function execution
   * @description_ja 安全な関数実行に必要なパラメータ
   * @description_tw 安全執行函數時需要的參數
   */
  interface SafeExecuteParams<T extends (...args: any[]) => any> {
    fn: T;
    fallback?: any;
    context?: any;
  }

  /**
   * 获取浏览器名称参数
   * @description_zh 获取浏览器名称时需要的参数
   * @description_en Parameters required for getting browser name
   * @description_ja ブラウザ名取得に必要なパラメータ
   * @description_tw 獲取瀏覽器名稱時需要的參數
   */
  interface GetBrowserNameParams {
    ua: string;
  }

  /**
   * 获取浏览器版本参数
   * @description_zh 获取浏览器版本时需要的参数
   * @description_en Parameters required for getting browser version
   * @description_ja ブラウザバージョン取得に必要なパラメータ
   * @description_tw 獲取瀏覽器版本時需要的參數
   */
  interface GetBrowserVersionParams {
    ua: string;
  }

  /**
   * 获取操作系统名称参数
   * @description_zh 获取操作系统名称时需要的参数
   * @description_en Parameters required for getting OS name
   * @description_ja OS名取得に必要なパラメータ
   * @description_tw 獲取作業系統名稱時需要的參數
   */
  interface GetOSNameParams {
    ua: string;
  }

  /**
   * 获取操作系统版本参数
   * @description_zh 获取操作系统版本时需要的参数
   * @description_en Parameters required for getting OS version
   * @description_ja OSバージョン取得に必要なパラメータ
   * @description_tw 獲取作業系統版本時需要的參數
   */
  interface GetOSVersionParams {
    ua: string;
  }

  /**
   * 获取设备类型参数
   * @description_zh 获取设备类型时需要的参数
   * @description_en Parameters required for getting device type
   * @description_ja デバイスタイプ取得に必要なパラメータ
   * @description_tw 獲取裝置類型時需要的參數
   */
  interface GetDeviceTypeParams {
    ua: string;
  }
}