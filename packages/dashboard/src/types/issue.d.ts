/**
 * 问题相关类型定义
 * Issue Related Type Definitions
 * 問題関連タイプ定義
 * 問題相關類型定義
 */

declare namespace Issue {
  /**
   * 获取问题列表参数
   * @description_zh 获取问题列表时的查询参数
   * @description_en Query parameters for getting issue list
   * @description_ja 問題リスト取得のクエリパラメータ
   * @description_tw 獲取問題清單時的查詢參數
   */
  interface GetIssuesParams {
    projectId: string;
    params?: {
      page?: number;
      pageSize?: number;
      status?: string;
      level?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    };
  }

  /**
   * 获取单个问题参数
   * @description_zh 获取指定问题详情的参数
   * @description_en Parameters for getting specific issue details
   * @description_ja 指定問題の詳細取得パラメータ
   * @description_tw 獲取指定問題詳情的參數
   */
  interface GetIssueParams {
    projectId: string;
    issueId: string;
  }

  /**
   * 更新问题状态参数
   * @description_zh 更新问题状态时需要的参数
   * @description_en Parameters required for updating issue status
   * @description_ja 問題ステータス更新に必要なパラメータ
   * @description_tw 更新問題狀態時需要的參數
   */
  interface UpdateIssueStatusParams {
    projectId: string;
    issueId: string;
    data: {
      status: string;
    };
  }

  /**
   * 问题列表项
   * @description_zh 问题列表中的单个问题数据
   * @description_en Single issue data in issue list
   * @description_ja 問題リスト内の単一問題データ
   * @description_tw 問題清單中的單個問題資料
   */
  interface IssueItem {
    id: string;
    title: string;
    message: string;
    status: 'open' | 'resolved' | 'ignored';
    level: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    userCount: number;
    firstSeen: string;
    lastSeen: string;
    tags: Record<string, string>;
    fingerprint: string;
  }

  /**
   * 问题详情
   * @description_zh 问题的完整详细信息
   * @description_en Complete detailed information of an issue
   * @description_ja 問題の完全な詳細情報
   * @description_tw 問題的完整詳細資訊
   */
  interface IssueDetail extends IssueItem {
    events: EventItem[];
    breadcrumbs: BreadcrumbItem[];
    deviceInfo: DeviceInfoItem;
    stack?: string;
  }

  /**
   * 事件项
   * @description_zh 问题相关的事件数据
   * @description_en Event data related to the issue
   * @description_ja 問題に関連するイベントデータ
   * @description_tw 問題相關的事件資料
   */
  interface EventItem {
    id: string;
    timestamp: string;
    message: string;
    level: string;
    data: Record<string, any>;
  }

  /**
   * 面包屑项
   * @description_zh 用户行为追踪面包屑数据
   * @description_en User behavior tracking breadcrumb data
   * @description_ja ユーザー行動追跡ブレッドクラムデータ
   * @description_tw 使用者行為追蹤麵包屑資料
   */
  interface BreadcrumbItem {
    type: string;
    message: string;
    timestamp: string;
    level?: string;
    category?: string;
    data?: Record<string, any>;
  }

  /**
   * 设备信息项
   * @description_zh 用户设备和环境信息
   * @description_en User device and environment information
   * @description_ja ユーザーデバイスと環境情報
   * @description_tw 使用者裝置和環境資訊
   */
  interface DeviceInfoItem {
    userAgent: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    deviceType: string;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    language: string;
    timezone: string;
  }
}