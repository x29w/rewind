/**
 * 查询 Issue DTO
 * Query Issues DTO
 * Issue クエリ DTO
 * 查詢 Issue DTO
 */

import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryIssuesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['open', 'resolved', 'ignored', 'regressed'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['error', 'warning', 'info'])
  level?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['lastSeen', 'firstSeen', 'eventCount', 'userCount'])
  sortBy?: string = 'lastSeen';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
