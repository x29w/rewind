import { request } from './client';

/**
 * 问题相关 API
 * Issue Related APIs
 * 問題関連API
 * 問題相關 API
 */

/**
 * 获取问题列表
 * @description_zh 获取指定项目的问题列表，支持筛选和分页
 * @description_en Get issue list for specified project with filtering and pagination support
 * @description_ja 指定されたプロジェクトの問題リストを取得し、フィルタリングとページネーションをサポート
 * @description_tw 獲取指定專案的問題清單，支援篩選和分頁
 */
export const getIssuesService = async (params: Issue.GetIssuesParams): Promise<Issue.IssueItem[]> => {
  return await request<Issue.IssueItem[]>({
    method: 'GET',
    url: `/projects/${params.projectId}/issues`,
    params: params.params,
  });
};

/**
 * 获取问题详情
 * @description_zh 获取指定问题的详细信息
 * @description_en Get detailed information for specified issue
 * @description_ja 指定された問題の詳細情報を取得
 * @description_tw 獲取指定問題的詳細資訊
 */
export const getIssueService = async (params: Issue.GetIssueParams): Promise<Issue.IssueDetail> => {
  return await request<Issue.IssueDetail>({
    method: 'GET',
    url: `/projects/${params.projectId}/issues/${params.issueId}`,
  });
};

/**
 * 更新问题状态
 * @description_zh 更新指定问题的状态（如已解决、进行中等）
 * @description_en Update status of specified issue (e.g., resolved, in progress, etc.)
 * @description_ja 指定された問題のステータスを更新（解決済み、進行中など）
 * @description_tw 更新指定問題的狀態（如已解決、進行中等）
 */
export const updateIssueStatusService = async (params: Issue.UpdateIssueStatusParams): Promise<Issue.IssueItem> => {
  return await request<Issue.IssueItem>({
    method: 'PATCH',
    url: `/projects/${params.projectId}/issues/${params.issueId}`,
    data: params.data,
  });
};
