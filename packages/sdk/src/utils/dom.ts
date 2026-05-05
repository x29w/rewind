/**
 * DOM 工具函数
 * DOM Utility Functions
 * DOM ユーティリティ関数
 * DOM 工具函數
 */

/**
 * 获取元素路径
 * Get element path
 * 要素パスを取得
 * 獲取元素路徑
 * 
 * @param element - HTML 元素 / HTML element / HTML 要素 / HTML 元素
 * @returns 元素路径字符串 / Element path string / 要素パス文字列 / 元素路徑字串
 */
export function getElementPath(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = element.className
    ? '.' + String(element.className).trim().split(/\s+/).slice(0, 2).join('.')
    : '';
  
  return `${tag}${id}${classes}`;
}

/**
 * 获取元素文本内容（截断）
 * Get element text content (truncated)
 * 要素テキストコンテンツを取得（切り詰め）
 * 獲取元素文字內容（截斷）
 * 
 * @param element - HTML 元素 / HTML element / HTML 要素 / HTML 元素
 * @param maxLength - 最大长度 / Max length / 最大長 / 最大長度
 * @returns 文本内容 / Text content / テキストコンテンツ / 文字內容
 */
export function getElementText(element: HTMLElement, maxLength: number = 50): string {
  const text = element.textContent?.trim() || 
               element.getAttribute('aria-label') || 
               element.getAttribute('title') || 
               element.getAttribute('alt') || 
               '';
  
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

/**
 * 获取元素的完整选择器路径
 * Get full selector path of element
 * 要素の完全なセレクタパスを取得
 * 獲取元素的完整選擇器路徑
 * 
 * @param element - HTML 元素 / HTML element / HTML 要素 / HTML 元素
 * @param maxDepth - 最大深度 / Max depth / 最大深度 / 最大深度
 * @returns 选择器路径 / Selector path / セレクタパス / 選擇器路徑
 */
export function getElementSelector(element: HTMLElement, maxDepth: number = 5): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;
  let depth = 0;
  
  while (current && current.nodeType === Node.ELEMENT_NODE && depth < maxDepth) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break; // ID 是唯一的，可以停止 / ID is unique, can stop / ID は一意、停止可能 / ID 是唯一的，可以停止
    }
    
    if (current.className) {
      const classes = String(current.className).trim().split(/\s+/).slice(0, 2);
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
    depth++;
  }
  
  return path.join(' > ');
}

/**
 * 检查元素是否可见
 * Check if element is visible
 * 要素が表示されているか確認
 * 檢查元素是否可見
 * 
 * @param element - HTML 元素 / HTML element / HTML 要素 / HTML 元素
 * @returns 是否可见 / Is visible / 表示されているか / 是否可見
 */
export function isElementVisible(element: HTMLElement): boolean {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}
