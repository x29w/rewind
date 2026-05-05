import { request } from './client';

/**
 * 项目相关 API
 * Project Related APIs
 * プロジェクト関連API
 * 專案相關 API
 */

/**
 * 获取项目列表
 * @description_zh 获取当前用户可访问的所有项目列表
 * @description_en Get list of all projects accessible to current user
 * @description_ja 現在のユーザーがアクセス可能なすべてのプロジェクトのリストを取得
 * @description_tw 獲取目前使用者可存取的所有專案清單
 */
export const getProjectsService = async (params: Project.GetProjectsParams): Promise<Project.ProjectItem[]> => {
  return await request<Project.ProjectItem[]>({
    method: 'GET',
    url: '/projects',
  });
};

/**
 * 获取项目详情
 * @description_zh 获取指定项目的详细信息
 * @description_en Get detailed information for specified project
 * @description_ja 指定されたプロジェクトの詳細情報を取得
 * @description_tw 獲取指定專案的詳細資訊
 */
export const getProjectService = async (params: Project.GetProjectParams): Promise<Project.ProjectItem> => {
  return await request<Project.ProjectItem>({
    method: 'GET',
    url: `/projects/${params.id}`,
  });
};

/**
 * 创建项目
 * @description_zh 创建新的监控项目
 * @description_en Create new monitoring project
 * @description_ja 新しい監視プロジェクトを作成
 * @description_tw 建立新的監控專案
 */
export const createProjectService = async (params: Project.CreateProjectParams): Promise<Project.ProjectItem> => {
  return await request<Project.ProjectItem>({
    method: 'POST',
    url: '/projects',
    data: params.data,
  });
};

/**
 * 更新项目
 * @description_zh 更新指定项目的信息
 * @description_en Update specified project information
 * @description_ja 指定されたプロジェクトの情報を更新
 * @description_tw 更新指定專案的資訊
 */
export const updateProjectService = async (params: Project.UpdateProjectParams): Promise<Project.ProjectItem> => {
  return await request<Project.ProjectItem>({
    method: 'PATCH',
    url: `/projects/${params.id}`,
    data: params.data,
  });
};
