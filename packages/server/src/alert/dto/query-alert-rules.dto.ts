/**
 * 查询告警规则 DTO
 * Query Alert Rules DTO
 * アラートルールクエリ DTO
 * 查詢告警規則 DTO
 */

import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAlertRulesDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  enabled?: boolean;
}
