/**
 * Server 问题服务类型定义
 * Server Issue Service Type Definitions
 * Server 問題サービスタイプ定義
 * Server 問題服務類型定義
 */

declare namespace Issue {
  /**
   * 获取问题列表参数
   * @description_zh 获取问题列表时需要的参数
   * @description_en Parameters required for getting issue list
   * @description_ja 問題リスト取得に必要なパラメータ
   * @description_tw 獲取問題清單時需要的參數
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
   * 更新问题参数
   * @description_zh 更新问题时需要的参数
   * @description_en Parameters required for updating issues
   * @description_ja 問題更新に必要なパラメータ
   * @description_tw 更新問題時需要的參數
   */
  interface UpdateIssueParams {
    projectId: string;
    issueId: string;
    data: {
      status?: string;
      assignee?: string;
      tags?: Record<string, string>;
    };
  }
}