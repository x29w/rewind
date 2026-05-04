/**
 * Issue 类型定义
 * Issue Type Definitions
 * Issue タイプ定義
 * Issue 類型定義
 */

import type { Breadcrumb } from './breadcrumb';
import type { DeviceInfo, NetworkInfo } from './device';
import type { SDKEvent } from './event';

/**
 * Issue 状态
 * Issue Status
 * Issue ステータス
 * Issue 狀態
 */
export type IssueStatus = 'open' | 'resolved' | 'ignored';

/**
 * Issue 级别
 * Issue Level
 * Issue レベル
 * Issue 級別
 */
export type IssueLevel = 'fatal' | 'error' | 'warning' | 'info';

/**
 * Issue 类型
 * Issue Type
 * Issue タイプ
 * Issue 類型
 */
export type IssueType = 'error' | 'blank_screen' | 'api_error' | 'performance';

/**
 * Issue 基础接口
 * Issue Base Interface
 * Issue 基本インターフェース
 * Issue 基礎介面
 */
export interface Issue {
  /** Issue ID */
  id: string;
  
  /** 指纹 / Fingerprint / フィンガープリント / 指紋 */
  fingerprint: string;
  
  /** 类型 / Type / タイプ / 類型 */
  type: IssueType;
  
  /** 级别 / Level / レベル / 級別 */
  level: IssueLevel;
  
  /** 状态 / Status / ステータス / 狀態 */
  status: IssueStatus;
  
  /** 标题 / Title / タイトル / 標題 */
  title: string;
  
  /** 消息 / Message / メッセージ / 訊息 */
  message: string;
  
  /** 堆栈 / Stack / スタック / 堆疊 */
  stack?: string;
  
  /** 事件数量 / Event count / イベント数 / 事件數量 */
  eventCount: number;
  
  /** 用户数量 / User count / ユーザー数 / 用戶數量 */
  userCount: number;
  
  /** 首次出现时间 / First seen / 初回出現時刻 / 首次出現時間 */
  firstSeen: Date;
  
  /** 最后出现时间 / Last seen / 最終出現時刻 / 最後出現時間 */
  lastSeen: Date;
  
  /** 应用 ID / App ID / アプリ ID / 應用 ID */
  appId: string;
  
  /** 应用版本 / App version / アプリバージョン / 應用版本 */
  appVersion?: string;
  
  /** 环境 / Environment / 環境 / 環境 */
  environment?: string;
  
  /** 标签 / Tags / タグ / 標籤 */
  tags?: Record<string, string>;
  
  /** 创建时间 / Created at / 作成時刻 / 建立時間 */
  createdAt: Date;
  
  /** 更新时间 / Updated at / 更新時刻 / 更新時間 */
  updatedAt: Date;
}

/**
 * Issue 事件
 * Issue Event
 * Issue イベント
 * Issue 事件
 */
export interface IssueEvent {
  /** 事件 ID / Event ID / イベント ID / 事件 ID */
  id: string;
  
  /** Issue ID */
  issueId: string;
  
  /** SDK 事件 / SDK event / SDK イベント / SDK 事件 */
  event: SDKEvent;
  
  /** 面包屑 / Breadcrumbs / ブレッドクラム / 麵包屑 */
  breadcrumbs: Breadcrumb[];
  
  /** 设备信息 / Device info / デバイス情報 / 裝置資訊 */
  device: DeviceInfo;
  
  /** 网络信息 / Network info / ネットワーク情報 / 網路資訊 */
  network?: NetworkInfo;
  
  /** 用户 ID / User ID / ユーザー ID / 用戶 ID */
  userId?: string;
  
  /** 会话 ID / Session ID / セッション ID / 會話 ID */
  sessionId: string;
  
  /** 页面 URL / Page URL / ページ URL / 頁面 URL */
  pageUrl: string;
  
  /** 创建时间 / Created at / 作成時刻 / 建立時間 */
  createdAt: Date;
}

/**
 * Issue 详情
 * Issue Detail
 * Issue 詳細
 * Issue 詳情
 */
export interface IssueDetail extends Issue {
  /** 最近事件 / Recent events / 最近のイベント / 最近事件 */
  recentEvents: IssueEvent[];
  
  /** AI 分析结果 / AI analysis / AI 分析結果 / AI 分析結果 */
  aiAnalysis?: {
    /** 摘要 / Summary / 要約 / 摘要 */
    summary?: string;
    
    /** 可能原因 / Possible causes / 可能な原因 / 可能原因 */
    possibleCauses?: string[];
    
    /** 修复建议 / Fix suggestions / 修正提案 / 修復建議 */
    fixSuggestions?: string[];
  };
}
