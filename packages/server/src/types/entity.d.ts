/**
 * Server 数据库实体类型定义
 * Server Database Entity Type Definitions
 * Server データベースエンティティタイプ定義
 * Server 資料庫實體類型定義
 */

declare namespace Entity {
  /**
   * 应用实体
   * @description_zh 应用程序的数据库实体结构
   * @description_en Application database entity structure
   * @description_ja アプリケーションデータベースエンティティ構造
   * @description_tw 應用程式的資料庫實體結構
   */
  interface App {
    id: string;
    name: string;
    description?: string;
    apiKey: string;
    createdAt: Date;
    updatedAt: Date;
  }

  /**
   * 问题实体
   * @description_zh 问题的数据库实体结构
   * @description_en Issue database entity structure
   * @description_ja 問題データベースエンティティ構造
   * @description_tw 問題的資料庫實體結構
   */
  interface Issue {
    id: string;
    appId: string;
    title: string;
    message: string;
    fingerprint: string;
    status: 'open' | 'resolved' | 'ignored';
    level: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    userCount: number;
    firstSeen: Date;
    lastSeen: Date;
    tags: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  }

  /**
   * 事件实体
   * @description_zh 事件的数据库实体结构
   * @description_en Event database entity structure
   * @description_ja イベントデータベースエンティティ構造
   * @description_tw 事件的資料庫實體結構
   */
  interface Event {
    id: string;
    issueId: string;
    timestamp: Date;
    message: string;
    level: string;
    stack?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    breadcrumbs: Record<string, any>;
    deviceInfo: Record<string, any>;
    extra: Record<string, any>;
    tags: Record<string, any>;
    createdAt: Date;
  }

  /**
   * 用户实体
   * @description_zh 用户的数据库实体结构
   * @description_en User database entity structure
   * @description_ja ユーザーデータベースエンティティ構造
   * @description_tw 使用者的資料庫實體結構
   */
  interface User {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  }
}