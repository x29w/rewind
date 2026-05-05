/**
 * 事件上报 DTO
 * Report Event DTO
 * イベントレポート DTO
 * 事件上報 DTO
 */

import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsNumber,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EventLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum EventType {
  ERROR = 'error',
  BEHAVIOR = 'behavior',
  PERFORMANCE = 'performance',
  BLANK_SCREEN = 'blank_screen',
  API = 'api',
}

export class BreadcrumbDto {
  @IsString()
  type: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsNumber()
  timestamp: number;
}

export class DeviceDto {
  @IsString()
  userAgent: string;

  @IsString()
  platform: string;

  @IsString()
  language: string;

  @IsOptional()
  @IsString()
  screenResolution?: string;

  @IsOptional()
  @IsString()
  viewportSize?: string;

  @IsOptional()
  @IsNumber()
  pixelRatio?: number;
}

export class NetworkDto {
  @IsOptional()
  @IsString()
  effectiveType?: string;

  @IsOptional()
  @IsNumber()
  downlink?: number;

  @IsOptional()
  @IsNumber()
  rtt?: number;
}

export class ReportEventDto {
  @IsEnum(EventType)
  type: EventType;

  @IsEnum(EventLevel)
  level: EventLevel;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  stack?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  sessionId: string;

  @IsString()
  pageUrl: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsObject()
  tags?: Record<string, string>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreadcrumbDto)
  breadcrumbs: BreadcrumbDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NetworkDto)
  network?: NetworkDto;

  @IsNumber()
  timestamp: number;

  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;
}
