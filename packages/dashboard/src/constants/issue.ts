/**
 * Issue 相关常量
 * Issue Related Constants
 * Issue 関連定数
 * Issue 相關常數
 */

/**
 * 问题级别颜色映射
 * @description_zh 问题级别对应的 Ant Design 颜色
 * @description_en Ant Design color mapping for issue levels
 * @description_ja 問題レベルに対応する Ant Design カラー
 * @description_tw 問題級別對應的 Ant Design 顏色
 */
export const ISSUE_LEVEL_COLORS: Issue.LevelColorMap = {
  fatal: 'red',
  error: 'orange',
  warning: 'gold',
  info: 'blue',
};

/**
 * 问题状态颜色映射
 * @description_zh 问题状态对应的 Ant Design 颜色
 * @description_en Ant Design color mapping for issue statuses
 * @description_ja 問題ステータスに対応する Ant Design カラー
 * @description_tw 問題狀態對應的 Ant Design 顏色
 */
export const ISSUE_STATUS_COLORS: Issue.StatusColorMap = {
  open: 'red',
  resolved: 'green',
  ignored: 'default',
  regressed: 'orange',
};
