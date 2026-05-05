/**
 * 更新 Issue 状态 DTO
 * Update Issue Status DTO
 * Issue ステータス更新 DTO
 * 更新 Issue 狀態 DTO
 */

import { IsString, IsIn } from 'class-validator';

export class UpdateIssueStatusDto {
  @IsString()
  @IsIn(['open', 'resolved', 'ignored', 'regressed'])
  status: string;
}
