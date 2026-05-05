/**
 * 项目相关类型定义
 * Project Related Type Definitions
 * プロジェクト関連タイプ定義
 * 專案相關類型定義
 */

declare namespace Project {
  /**
   * 获取项目列表参数
   * @description_zh 获取项目列表时的参数（当前为空，预留扩展）
   * @description_en Parameters for getting project list (currently empty, reserved for extension)
   * @description_ja プロジェクトリスト取得のパラメータ（現在は空、拡張用に予約）
   * @description_tw 獲取專案清單時的參數（目前為空，預留擴展）
   */
  interface GetProjectsParams {}

  /**
   * 获取单个项目参数
   * @description_zh 获取指定项目详情的参数
   * @description_en Parameters for getting specific project details
   * @description_ja 指定プロジェクトの詳細取得パラメータ
   * @description_tw 獲取指定專案詳情的參數
   */
  interface GetProjectParams {
    id: string;
  }

  /**
   * 创建项目参数
   * @description_zh 创建新项目时需要的参数
   * @description_en Parameters required for creating new project
   * @description_ja 新しいプロジェクト作成に必要なパラメータ
   * @description_tw 建立新專案時需要的參數
   */
  interface CreateProjectParams {
    data: {
      name: string;
      description?: string;
    };
  }

  /**
   * 更新项目参数
   * @description_zh 更新项目信息时需要的参数
   * @description_en Parameters required for updating project information
   * @description_ja プロジェクト情報更新に必要なパラメータ
   * @description_tw 更新專案資訊時需要的參數
   */
  interface UpdateProjectParams {
    id: string;
    data: {
      name?: string;
      description?: string;
    };
  }

  /**
   * 项目数据项
   * @description_zh 项目的完整数据结构
   * @description_en Complete data structure of a project
   * @description_ja プロジェクトの完全なデータ構造
   * @description_tw 專案的完整資料結構
   */
  interface ProjectItem {
    id: string;
    name: string;
    description?: string;
    apiKey: string;
    createdAt: string;
    updatedAt: string;
    issueCount: number;
    errorRate: number;
  }
}