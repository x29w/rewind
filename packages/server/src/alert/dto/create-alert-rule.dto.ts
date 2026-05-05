/**
 * 创建告警规则 DTO
 * Create Alert Rule DTO
 * アラートルール作成 DTO
 * 建立告警規則 DTO
 */

import {
  IsString,
  IsObject,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';

export class CreateAlertRuleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsIn([
    'error_count',
    'new_issue_count',
    'issue_regressed',
    'blank_screen_count',
    'api_error_rate',
    'lcp_p75',
  ])
  metric: string;

  @IsObject()
  condition: {
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
    threshold: number;
    window: string; // '5m', '1h', '1d'
  };

  @IsOptional()
  @IsObject()
  filters?: any;

  @IsObject()
  actions: Array<{
    type: 'webhook' | 'email';
    url?: string;
    to?: string[];
  }>;

  @IsOptional()
  @IsInt()
  @Min(0)
  silencePeriod?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
