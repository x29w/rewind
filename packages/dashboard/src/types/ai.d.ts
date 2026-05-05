/**
 * AI 分析相关类型定义
 * AI Analysis Related Type Definitions
 * AI分析関連タイプ定義
 * AI 分析相關類型定義
 */

declare namespace AI {
  /**
   * 分析问题参数
   * @description_zh 使用AI分析问题时需要的参数
   * @description_en Parameters required for AI issue analysis
   * @description_ja AI問題分析に必要なパラメータ
   * @description_tw 使用AI分析問題時需要的參數
   */
  interface AnalyzeIssueParams {
    issueId: string;
  }

  /**
   * 获取分析结果参数
   * @description_zh 获取AI分析结果时需要的参数
   * @description_en Parameters required for getting AI analysis result
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
   * AI 分析结果
   * @description_zh AI分析问题后返回的结果数据
   * @description_en Result data returned after AI issue analysis
   * @description_ja AI問題分析後に返される結果データ
   * @description_tw AI分析問題後返回的結果資料
   */
  interface AnalysisResult {
    rootCause: string;
    possibleReasons: string[];
    fixSuggestions: string[];
    relatedIssues: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }
}