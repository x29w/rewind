/**
 * 白屏检测插件
 * Blank Screen Detection Plugin
 * ブランクスクリーン検出プラグイン
 * 白屏檢測外掛程式
 */

import type { SDK } from '../core/types/index.d';

export class BlankScreenPlugin implements SDK.Plugin {
  name = 'BlankScreenPlugin';
  private client: SDK.Client | null = null;
  private checkTimer: number | null = null;
  private fcpTimeout = 5000; // 5 seconds
  private samplingPoints = 9; // 3x3 grid
  private threshold = 0.8; // 80% empty points = blank screen

  setup(client: SDK.Client): void {
    this.client = client;
    this.startDetection();
  }

  teardown(): void {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      this.checkTimer = null;
    }
    this.client = null;
  }

  /**
   * 开始白屏检测
   * Start blank screen detection
   * ブランクスクリーン検出を開始
   * 開始白屏檢測
   */
  private startDetection(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // 等待 FCP 或超时
    // Wait for FCP or timeout
    // FCP を待機またはタイムアウト
    // 等待 FCP 或逾時
    this.checkTimer = window.setTimeout(() => {
      this.checkBlankScreen();
    }, this.fcpTimeout);

    // 监听 FCP
    // Listen for FCP
    // FCP を監視
    // 監聽 FCP
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              if (this.checkTimer) {
                clearTimeout(this.checkTimer);
                this.checkTimer = null;
              }
              observer.disconnect();
              break;
            }
          }
        });
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('[BlankScreenPlugin] PerformanceObserver not supported');
      }
    }
  }

  /**
   * 检查是否白屏
   * Check if screen is blank
   * 画面が空白かチェック
   * 檢查是否白屏
   */
  private checkBlankScreen(): void {
    if (!this.client) return;

    const isBlank = this.isScreenBlank();

    if (isBlank) {
      this.client.addBreadcrumb({
        type: 'blank_screen',
        category: 'detection',
        message: 'Blank screen detected',
        data: {
          fcpTimeout: this.fcpTimeout,
          samplingPoints: this.samplingPoints,
          threshold: this.threshold,
        },
        timestamp: Date.now(),
      });

      this.client.captureError(
        new Error('Blank screen detected'),
        {
          level: 'fatal',
          type: 'blank_screen',
          tags: {
            detection: 'automatic',
          },
        }
      );
    }
  }

  /**
   * DOM 采样检测白屏
   * DOM sampling for blank screen detection
   * DOM サンプリングでブランクスクリーン検出
   * DOM 採樣檢測白屏
   */
  private isScreenBlank(): boolean {
    const { innerWidth, innerHeight } = window;
    const points = this.getSamplingPoints(innerWidth, innerHeight);
    let emptyCount = 0;

    for (const point of points) {
      const element = document.elementFromPoint(point.x, point.y);
      
      if (this.isEmptyElement(element)) {
        emptyCount++;
      }
    }

    const emptyRatio = emptyCount / points.length;
    return emptyRatio >= this.threshold;
  }

  /**
   * 获取采样点
   * Get sampling points
   * サンプリングポイントを取得
   * 取得採樣點
   */
  private getSamplingPoints(width: number, height: number): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    const cols = 3;
    const rows = 3;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        points.push({
          x: (width / (cols + 1)) * (j + 1),
          y: (height / (rows + 1)) * (i + 1),
        });
      }
    }

    return points;
  }

  /**
   * 判断元素是否为空
   * Check if element is empty
   * 要素が空かチェック
   * 判斷元素是否為空
   */
  private isEmptyElement(element: Element | null): boolean {
    if (!element) return true;

    // html, body 视为空
    // html, body are considered empty
    // html、body は空とみなす
    // html、body 視為空
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'html' || tagName === 'body') {
      return true;
    }

    // 检查是否有背景色或背景图
    // Check for background color or image
    // 背景色または背景画像をチェック
    // 檢查是否有背景色或背景圖
    const style = window.getComputedStyle(element);
    const bgColor = style.backgroundColor;
    const bgImage = style.backgroundImage;

    if (bgImage && bgImage !== 'none') {
      return false;
    }

    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return false;
    }

    return true;
  }
}
