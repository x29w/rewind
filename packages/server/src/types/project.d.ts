/**
 * Server 项目服务类型定义
 * Server Project Service Type Definitions
 * Server プロジェクトサービスタイプ定義
 * Server 專案服務類型定義
 */

declare namespace Project {
  /**
   * 创建项目参数
   * @description_zh 创建项目时需要的参数
   * @description_en Parameters required for creating projects
   * @description_ja プロジェクト作成に必要なパラメータ
   * @description_tw 建立專案時需要的參數
   */
  interface CreateProjectParams {
    data: {
      name: string;
      description?: string;
    };
  }

  /**
   * 更新项目参数
   * @description_zh 更新项目时需要的参数
   * @description_en Parameters required for updating projects
   * @description_ja プロジェクト更新に必要なパラメータ
   * @description_tw 更新專案時需要的參數
   */
  interface UpdateProjectParams {
    id: string;
    data: {
      name?: string;
      description?: string;
    };
  }
}