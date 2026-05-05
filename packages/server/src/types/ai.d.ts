/**
 * Server AI 服务类型定义
 * Server AI Service Type Definitions
 * Server AI サービスタイプ定義
 * Server AI 服務類型定義
 */

declare namespace AI {
  /**
   * AI 分析请求参数
   * @description_zh AI 分析问题时需要的参数
   * @description_en Parameters required for AI issue analysis
   * @description_ja AI問題分析に必要なパラメータ
   * @description_tw AI 分析問題時需要的參數
   */
  interface AnalyzeIssueParams {
    issueId: string;
  }

  /**
   * 获取分析结果参数
   * @description_zh 获取AI分析结果时需要的参数
   * @description_en Parameters required for getting AI analysis results
   * @description_ja AI分析結果取得に必要なパラメータ
   * @description_tw 獲取AI分析結果時需要的參數
   */
  interface GetAnalysisParams {
    issueId: string;
  }

  /**
   * 查找相似问题参数
   * @description_zh 查找相似问题时需要的参数
   * @description_en Parameters required for finding similar issues
   * @description_ja 類似問題検索に必要なパラメータ
   * @description_tw 查找相似問題時需要的參數
   */
  interface FindSimilarParams {
    issueId: string;
  }

  /**
   * 错误分析参数
   * @description_zh 分析错误时需要的参数
   * @description_en Parameters required for error analysis
   * @description_ja エラー分析に必要なパラメータ
   * @description_tw 分析錯誤時需要的參數
   */
  interface AnalyzeErrorParams {
    errorMessage: string;
    stack?: string;
    breadcrumbs?: any[];
    deviceInfo?: any;
  }

  /**
   * 查找相似问题服务参数
   * @description_zh 查找相似问题服务时需要的参数
   * @description_en Parameters required for finding similar issues service
   * @description_ja 類似問題検索サービスに必要なパラメータ
   * @description_tw 查找相似問題服務時需要的參數
   */
  interface FindSimilarIssuesParams {
    issueId: string;
    limit?: number;
  }

  /**
   * AI 分析结果
   * @description_zh AI 分析的结果数据结构
   * @description_en AI analysis result data structure
   * @description_ja AI分析結果のデータ構造
   * @description_tw AI 分析的結果資料結構
   */
  interface AnalysisResult {
    rootCause: string;
    possibleReasons: string[];
    fixSuggestions: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }
}