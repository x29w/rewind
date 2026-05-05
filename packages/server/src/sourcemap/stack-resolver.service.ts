/**
 * 堆栈还原服务
 * Stack Resolver Service
 * スタック解決サービス
 * 堆疊還原服務
 */

import { Injectable } from '@nestjs/common';
import { SourceMapConsumer } from 'source-map';
import { LRUCache } from 'lru-cache';
import { SourcemapService } from './sourcemap.service';

interface StackFrame {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  functionName?: string;
}

interface ResolvedFrame {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  functionName?: string;
  source?: string;
  sourceContent?: string;
}

@Injectable()
export class StackResolverService {
  private readonly cache: LRUCache<string, SourceMapConsumer>;
  private readonly resolvedCache: LRUCache<string, string>;

  constructor(private readonly sourcemapService: SourcemapService) {
    // SourceMap 对象缓存（最多 100 个）
    this.cache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 60, // 1 小时
    });

    // 已还原堆栈缓存（最多 1000 个）
    this.resolvedCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 30, // 30 分钟
    });
  }

  /**
   * 还原堆栈
   * Resolve Stack
   * スタックを解決
   * 還原堆疊
   *
   * @description_zh 使用 SourceMap 还原压缩后的堆栈信息
   * @description_en Resolve minified stack using sourcemap
   * @description_ja SourceMap を使用して圧縮されたスタックを解決
   * @description_tw 使用 SourceMap 還原壓縮後的堆疊資訊
   */
  async resolve({
    stack,
    appVersion,
    projectId,
  }: {
    stack: string;
    appVersion: string;
    projectId: string;
  }): Promise<string> {
    // 检查缓存
    const cacheKey = `${projectId}:${appVersion}:${stack}`;
    const cached = this.resolvedCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const frames = this.parseStack(stack);
      const resolvedFrames: ResolvedFrame[] = [];

      for (const frame of frames) {
        const resolved = await this.resolveFrame({
          frame,
          appVersion,
          projectId,
        });
        resolvedFrames.push(resolved);
      }

      const resolvedStack = this.formatStack(resolvedFrames);

      // 缓存结果
      this.resolvedCache.set(cacheKey, resolvedStack);

      return resolvedStack;
    } catch (error) {
      console.error('Failed to resolve stack:', error);
      return stack; // 失败时返回原始堆栈
    }
  }

  /**
   * 还原单个堆栈帧
   * Resolve Stack Frame
   * スタックフレームを解決
   * 還原單個堆疊幀
   */
  private async resolveFrame({
    frame,
    appVersion,
    projectId,
  }: {
    frame: StackFrame;
    appVersion: string;
    projectId: string;
  }): Promise<ResolvedFrame> {
    try {
      const consumer = await this.getSourceMapConsumer({
        projectId,
        appVersion,
        fileName: frame.fileName,
      });

      if (!consumer) {
        return frame;
      }

      const original = consumer.originalPositionFor({
        line: frame.lineNumber,
        column: frame.columnNumber,
      });

      if (!original.source) {
        return frame;
      }

      return {
        fileName: original.source,
        lineNumber: original.line || frame.lineNumber,
        columnNumber: original.column || frame.columnNumber,
        functionName: original.name || frame.functionName,
        source: original.source,
      };
    } catch (error) {
      console.error('Failed to resolve frame:', error);
      return frame;
    }
  }

  /**
   * 获取 SourceMap Consumer
   * Get SourceMap Consumer
   * SourceMap Consumer を取得
   * 取得 SourceMap Consumer
   */
  private async getSourceMapConsumer({
    projectId,
    appVersion,
    fileName,
  }: {
    projectId: string;
    appVersion: string;
    fileName: string;
  }): Promise<SourceMapConsumer | null> {
    const cacheKey = `${projectId}:${appVersion}:${fileName}`;

    // 检查缓存
    let consumer = this.cache.get(cacheKey);
    if (consumer) {
      return consumer;
    }

    // 从数据库加载
    const sourcemap = await this.sourcemapService.findOne({
      projectId,
      appVersion,
      fileName: `${fileName}.map`,
    });

    if (!sourcemap) {
      return null;
    }

    try {
      consumer = await new SourceMapConsumer(JSON.parse(sourcemap.content));
      this.cache.set(cacheKey, consumer);
      return consumer;
    } catch (error) {
      console.error('Failed to parse sourcemap:', error);
      return null;
    }
  }

  /**
   * 解析堆栈字符串
   * Parse Stack String
   * スタック文字列を解析
   * 解析堆疊字串
   */
  private parseStack(stack: string): StackFrame[] {
    const frames: StackFrame[] = [];
    const lines = stack.split('\n');

    for (const line of lines) {
      // 匹配格式：at functionName (file.js:line:column)
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        frames.push({
          functionName: match[1],
          fileName: match[2],
          lineNumber: parseInt(match[3], 10),
          columnNumber: parseInt(match[4], 10),
        });
        continue;
      }

      // 匹配格式：at file.js:line:column
      const match2 = line.match(/at\s+(.+?):(\d+):(\d+)/);
      if (match2) {
        frames.push({
          fileName: match2[1],
          lineNumber: parseInt(match2[2], 10),
          columnNumber: parseInt(match2[3], 10),
        });
      }
    }

    return frames;
  }

  /**
   * 格式化堆栈
   * Format Stack
   * スタックをフォーマット
   * 格式化堆疊
   */
  private formatStack(frames: ResolvedFrame[]): string {
    return frames
      .map((frame) => {
        const func = frame.functionName || '<anonymous>';
        return `    at ${func} (${frame.fileName}:${frame.lineNumber}:${frame.columnNumber})`;
      })
      .join('\n');
  }
}
