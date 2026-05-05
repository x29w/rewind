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
 * @description_zh 获取HTML元素的简化路径表示，包含标签名、ID和前两个类名
 * @description_en Get simplified path representation of HTML element, including tag name, ID and first two class names
 * @description_ja HTML要素の簡略化されたパス表現を取得し、タグ名、ID、最初の2つのクラス名を含む
 * @description_tw 獲取HTML元素的簡化路徑表示，包含標籤名、ID和前兩個類別名
 * 
 * @param params - 参数对象 / Parameter object / パラメータオブジェクト / 參數物件
 * @returns 元素路径字符串 / Element path string / 要素パス文字列 / 元素路徑字串
 */
export const getElementPath = (params: Utils.GetElementPathParams): string => {
  const { element } = params;
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = element.className
    ? '.' + String(element.className).trim().split(/\s+/).slice(0, 2).join('.')
    : '';
  
  return `${tag}${id}${classes}`;
};

/**
 * 获取元素文本内容（截断）
 * Get element text content (truncated)
 * 要素テキストコンテンツを取得（切り詰め）
 * 獲取元素文字內容（截斷）
 * 
 * @description_zh 获取HTML元素的文本内容，支持多种文本来源并自动截断
 * @description_en Get text content of HTML element, supports multiple text sources and auto-truncation
 * @description_ja HTML要素のテキストコンテンツを取得し、複数のテキストソースをサポートし自動切り詰め
 * @description_tw 獲取HTML元素的文字內容，支援多種文字來源並自動截斷
 * 
 * @param params - 参数对象 / Parameter object / パラメータオブジェクト / 參數物件
 * @returns 文本内容 / Text content / テキストコンテンツ / 文字內容
 */
export const getElementText = (params: Utils.GetElementTextParams): string => {
  const { element, maxLength = 50 } = params;
  const text = element.textContent?.trim() || 
               element.getAttribute('aria-label') || 
               element.getAttribute('title') || 
               element.getAttribute('alt') || 
               '';
  
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

/**
 * 获取元素的完整选择器路径
 * Get full selector path of element
 * 要素の完全なセレクタパスを取得
 * 獲取元素的完整選擇器路徑
 * 
 * @description_zh 获取HTML元素的完整CSS选择器路径，用于精确定位元素
 * @description_en Get full CSS selector path of HTML element for precise element location
 * @description_ja HTML要素の完全なCSSセレクタパスを取得し、要素の正確な位置特定に使用
 * @description_tw 獲取HTML元素的完整CSS選擇器路徑，用於精確定位元素
 * 
 * @param params - 参数对象 / Parameter object / パラメータオブジェクト / 參數物件
 * @returns 选择器路径 / Selector path / セレクタパス / 選擇器路徑
 */
export const getElementSelector = (params: Utils.GetElementSelectorParams): string => {
  const { element, maxDepth = 5 } = params;
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
};

/**
 * 检查元素是否可见
 * Check if element is visible
 * 要素が表示されているか確認
 * 檢查元素是否可見
 * 
 * @description_zh 检查HTML元素是否在页面中可见，考虑CSS样式和尺寸
 * @description_en Check if HTML element is visible on the page, considering CSS styles and dimensions
 * @description_ja HTML要素がページ上で表示されているかを確認し、CSSスタイルと寸法を考慮
 * @description_tw 檢查HTML元素是否在頁面中可見，考慮CSS樣式和尺寸
 * 
 * @param params - 参数对象 / Parameter object / パラメータオブジェクト / 參數物件
 * @returns 是否可见 / Is visible / 表示されているか / 是否可見
 */
export const isElementVisible = (params: Utils.IsElementVisibleParams): boolean => {
  const { element } = params;
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
};
