import { request } from './client';

/**
 * AI 分析相关 API
 * AI Analysis Related APIs
 * AI分析関連API
 * AI 分析相關 API
 */

/**
 * 分析问题
 * @description_zh 使用AI分析指定问题，生成分析报告
 * @description_en Use AI to analyze specified issue and generate analysis report
 * @description_ja AIを使用して指定された問題を分析し、分析レポートを生成
 * @description_tw 使用AI分析指定問題，產生分析報告
 */
export const analyzeIssueService = async (params: AI.AnalyzeIssueParams): Promise<AI.AnalysisResult> => {
  return await request<AI.AnalysisResult>({
    method: 'POST',
    url: `/ai/analyze/${params.issueId}`,
  });
};

/**
 * 获取分析结果
 * @description_zh 获取问题的AI分析结果
 * @description_en Get AI analysis result for the issue
 * @description_ja 問題のAI分析結果を取得
 * @description_tw 獲取問題的AI分析結果
 */
export const getAnalysisService = async (params: AI.GetAnalysisParams): Promise<AI.AnalysisResult> => {
  return await request<AI.AnalysisResult>({
    method: 'GET',
    url: `/ai/analysis/${params.issueId}`,
  });
};

/**
 * 查找相似问题
 * @description_zh 使用AI查找与当前问题相似的历史问题
 * @description_en Use AI to find similar historical issues to the current one
 * @description_ja AIを使用して現在の問題に類似した過去の問題を検索
 * @description_tw 使用AI查找與當前問題相似的歷史問題
 */
export const findSimilarService = async (params: AI.FindSimilarParams): Promise<Issue.IssueItem[]> => {
  return await request<Issue.IssueItem[]>({
    method: 'POST',
    url: `/ai/similar/${params.issueId}`,
  });
};
