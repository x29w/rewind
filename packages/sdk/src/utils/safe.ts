/**
 * 安全执行工具函数
 * Safe Execution Utility Functions
 * 安全実行ユーティリティ関数
 * 安全執行工具函數
 */

/**
 * Safe execution wrapper
 * 
 * @description_zh 安全执行包装器，捕获错误
 * @description_en Safe execution wrapper, catch errors
 * @description_ja 安全実行ラッパー、エラーをキャッチ
 * @description_tw 安全執行包裝器，捕獲錯誤
 * @param fn - 要执行的函数 / Function to execute / 実行する関数 / 要執行的函數
 * @param context - 错误上下文 / Error context / エラーコンテキスト / 錯誤上下文
 * @param fallback - 失败时的回退值 / Fallback value on failure / 失敗時のフォールバック値 / 失敗時的回退值
 * @returns 执行结果或回退值 / Execution result or fallback / 実行結果またはフォールバック / 執行結果或回退值
 */
export const safeExecute = <T>(
  fn: () => T,
  context: string = 'Unknown',
  fallback?: T
): T | undefined {
  try {
    return fn();
  } catch (error) {
    console.error(`[Rewind SDK] Error in ${context}:`, error);
    return fallback;
  }
}

/**
 * Safe async execution wrapper
 * 
 * @description_zh 安全执行异步函数包装器
 * @description_en Safe async execution wrapper
 * @description_ja 安全非同期実行ラッパー
 * @description_tw 安全執行異步函數包裝器
 * @param fn - 要执行的异步函数 / Async function to execute / 実行する非同期関数 / 要執行的異步函數
 * @param context - 错误上下文 / Error context / エラーコンテキスト / 錯誤上下文
 * @param fallback - 失败时的回退值 / Fallback value on failure / 失敗時のフォールバック値 / 失敗時的回退值
 * @returns 执行结果或回退值 / Execution result or fallback / 実行結果またはフォールバック / 執行結果或回退值
 */
export const safeExecuteAsync = async <T>(
  fn: () => Promise<T>,
  context: string = 'Unknown',
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[Rewind SDK] Error in ${context}:`, error);
    return fallback;
  }
}

/**
 * Throttle function execution
 * 
 * @description_zh 节流函数执行
 * @description_en Throttle function execution
 * @description_ja 関数実行をスロットル
 * @description_tw 節流函數執行
 * @param fn - 要节流的函数 / Function to throttle / スロットルする関数 / 要節流的函數
 * @param delay - 延迟时间（毫秒）/ Delay time (ms) / 遅延時間（ミリ秒）/ 延遲時間（毫秒）
 * @returns 节流后的函数 / Throttled function / スロットルされた関数 / 節流後的函數
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function execution
 * 
 * @description_zh 防抖函数执行
 * @description_en Debounce function execution
 * @description_ja 関数実行をデバウンス
 * @description_tw 防抖函數執行
 * @param fn - 要防抖的函数 / Function to debounce / デバウンスする関数 / 要防抖的函數
 * @param delay - 延迟时间（毫秒）/ Delay time (ms) / 遅延時間（ミリ秒）/ 延遲時間（毫秒）
 * @returns 防抖后的函数 / Debounced function / デバウンスされた関数 / 防抖後的函數
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
