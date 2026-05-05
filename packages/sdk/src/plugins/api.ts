/**
 * API 监控插件
 * API Monitoring Plugin
 * API モニタリングプラグイン
 * API 監控外掛程式
 */

import type { SDK } from '../core/types/index.d';

interface RequestInfo {
  url: string;
  method: string;
  startTime: number;
  requestData?: any;
}

export class ApiPlugin implements SDK.Plugin {
  name = 'ApiPlugin';
  private client: SDK.Client | null = null;
  private originalXHR: typeof XMLHttpRequest | null = null;
  private originalFetch: typeof fetch | null = null;
  private pendingRequests = new Map<any, RequestInfo>();

  setup(client: SDK.Client): void {
    this.client = client;
    this.hijackXHR();
    this.hijackFetch();
  }

  teardown(): void {
    this.restoreXHR();
    this.restoreFetch();
    this.pendingRequests.clear();
    this.client = null;
  }

  /**
   * 劫持 XMLHttpRequest
   * Hijack XMLHttpRequest
   * XMLHttpRequest をハイジャック
   * 劫持 XMLHttpRequest
   */
  private hijackXHR(): void {
    if (typeof XMLHttpRequest === 'undefined') return;

    this.originalXHR = XMLHttpRequest;
    const self = this;

    const ProxyXHR = function(this: XMLHttpRequest) {
      const xhr = new self.originalXHR!();
      const requestInfo: RequestInfo = {
        url: '',
        method: '',
        startTime: 0,
      };

      const originalOpen = xhr.open;
      xhr.open = function(method: string, url: string | URL, ...args: any[]) {
        requestInfo.method = method;
        requestInfo.url = typeof url === 'string' ? url : url.toString();
        return originalOpen.apply(xhr, [method, url, ...args] as any);
      };

      const originalSend = xhr.send;
      xhr.send = function(body?: any) {
        requestInfo.startTime = Date.now();
        requestInfo.requestData = body;
        self.pendingRequests.set(xhr, requestInfo);

        self.client?.addBreadcrumb({
          type: 'http',
          category: 'xhr',
          message: `${requestInfo.method} ${requestInfo.url}`,
          data: {
            method: requestInfo.method,
            url: requestInfo.url,
          },
          timestamp: Date.now(),
        });

        return originalSend.apply(xhr, [body] as any);
      };

      xhr.addEventListener('loadend', function() {
        const info = self.pendingRequests.get(xhr);
        if (!info) return;

        const duration = Date.now() - info.startTime;
        const status = xhr.status;

        if (status >= 400) {
          self.client?.captureError(
            new Error(`API Error: ${info.method} ${info.url} - ${status}`),
            {
              level: status >= 500 ? 'error' : 'warning',
              type: 'api',
              tags: {
                method: info.method,
                url: info.url,
                status: status.toString(),
                duration: duration.toString(),
              },
            }
          );
        }

        self.pendingRequests.delete(xhr);
      });

      return xhr;
    } as any;

    ProxyXHR.prototype = this.originalXHR.prototype;
    (window as any).XMLHttpRequest = ProxyXHR;
  }

  /**
   * 劫持 Fetch API
   * Hijack Fetch API
   * Fetch API をハイジャック
   * 劫持 Fetch API
   */
  private hijackFetch(): void {
    if (typeof fetch === 'undefined') return;

    this.originalFetch = fetch;
    const self = this;

    (window as any).fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      const startTime = Date.now();

      self.client?.addBreadcrumb({
        type: 'http',
        category: 'fetch',
        message: `${method} ${url}`,
        data: {
          method,
          url,
        },
        timestamp: Date.now(),
      });

      return self.originalFetch!(input, init)
        .then((response) => {
          const duration = Date.now() - startTime;

          if (!response.ok) {
            self.client?.captureError(
              new Error(`API Error: ${method} ${url} - ${response.status}`),
              {
                level: response.status >= 500 ? 'error' : 'warning',
                type: 'api',
                tags: {
                  method,
                  url,
                  status: response.status.toString(),
                  duration: duration.toString(),
                },
              }
            );
          }

          return response;
        })
        .catch((error) => {
          const duration = Date.now() - startTime;

          self.client?.captureError(
            error,
            {
              level: 'error',
              type: 'api',
              tags: {
                method,
                url,
                duration: duration.toString(),
              },
            }
          );

          throw error;
        });
    };
  }

  /**
   * 恢复 XMLHttpRequest
   * Restore XMLHttpRequest
   * XMLHttpRequest を復元
   * 恢復 XMLHttpRequest
   */
  private restoreXHR(): void {
    if (this.originalXHR) {
      (window as any).XMLHttpRequest = this.originalXHR;
      this.originalXHR = null;
    }
  }

  /**
   * 恢复 Fetch
   * Restore Fetch
   * Fetch を復元
   * 恢復 Fetch
   */
  private restoreFetch(): void {
    if (this.originalFetch) {
      (window as any).fetch = this.originalFetch;
      this.originalFetch = null;
    }
  }
}
