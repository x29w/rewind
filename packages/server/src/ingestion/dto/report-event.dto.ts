/**
 * Event Report DTO
 * 
 * @description_zh 事件上报数据传输对象
 * @description_en Event report data transfer object
 * @description_ja イベントレポートデータ転送オブジェクト
 * @description_tw 事件上報資料傳輸物件
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Event Level Enum
 * 
 * @description_zh 事件级别枚举
 * @description_en Event severity level
 * @description_ja イベントレベル列挙
 * @description_tw 事件級別列舉
 */
export enum EventLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Event Type Enum
 * 
 * @description_zh 事件类型枚举
 * @description_en Event type classification
 * @description_ja イベントタイプ列挙
 * @description_tw 事件類型列舉
 */
export enum EventType {
  ERROR = 'error',
  BEHAVIOR = 'behavior',
  PERFORMANCE = 'performance',
  BLANK_SCREEN = 'blank_screen',
  API = 'api',
}

/**
 * Breadcrumb DTO
 * 
 * @description_zh 面包屑数据对象
 * @description_en User action breadcrumb
 * @description_ja ブレッドクラムデータ
 * @description_tw 麵包屑資料物件
 */
export class BreadcrumbDto {
  /**
   * @description_zh 面包屑类型
   * @description_en Breadcrumb type
   * @example "click"
   */
  @ApiProperty({ description: 'Breadcrumb type', example: 'click' })
  @IsString()
  type: string;

  /**
   * @description_zh 面包屑分类
   * @description_en Breadcrumb category
   * @example "user"
   */
  @ApiProperty({ description: 'Breadcrumb category', example: 'user' })
  @IsString()
  category: string;

  /**
   * @description_zh 面包屑消息
   * @description_en Breadcrumb message
   */
  @ApiPropertyOptional({ description: 'Breadcrumb message' })
  @IsOptional()
  @IsString()
  message?: string;

  /**
   * @description_zh 附加数据
   * @description_en Additional data
   */
  @ApiPropertyOptional({ description: 'Additional data' })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  /**
   * @description_zh 时间戳
   * @description_en Timestamp in milliseconds
   */
  @ApiProperty({ description: 'Timestamp in milliseconds', example: 1704067200000 })
  @IsNumber()
  timestamp: number;
}

/**
 * Device Information DTO
 * 
 * @description_zh 设备信息数据对象
 * @description_en Device information
 * @description_ja デバイス情報
 * @description_tw 裝置資訊物件
 */
export class DeviceDto {
  /**
   * @description_zh 用户代理字符串
   * @description_en User agent string
   */
  @ApiProperty({ description: 'User agent string' })
  @IsString()
  userAgent: string;

  /**
   * @description_zh 平台类型
   * @description_en Platform type
   * @example "Windows"
   */
  @ApiProperty({ description: 'Platform type', example: 'Windows' })
  @IsString()
  platform: string;

  /**
   * @description_zh 语言设置
   * @description_en Language setting
   * @example "zh-CN"
   */
  @ApiProperty({ description: 'Language setting', example: 'zh-CN' })
  @IsString()
  language: string;

  /**
   * @description_zh 屏幕分辨率
   * @description_en Screen resolution
   * @example "1920x1080"
   */
  @ApiPropertyOptional({ description: 'Screen resolution', example: '1920x1080' })
  @IsOptional()
  @IsString()
  screenResolution?: string;

  /**
   * @description_zh 视口大小
   * @description_en Viewport size
   * @example "1920x969"
   */
  @ApiPropertyOptional({ description: 'Viewport size', example: '1920x969' })
  @IsOptional()
  @IsString()
  viewportSize?: string;

  /**
   * @description_zh 像素比
   * @description_en Device pixel ratio
   * @example 2
   */
  @ApiPropertyOptional({ description: 'Device pixel ratio', example: 2 })
  @IsOptional()
  @IsNumber()
  pixelRatio?: number;
}

/**
 * Network Information DTO
 * 
 * @description_zh 网络信息数据对象
 * @description_en Network information
 * @description_ja ネットワーク情報
 * @description_tw 網路資訊物件
 */
export class NetworkDto {
  /**
   * @description_zh 有效连接类型
   * @description_en Effective connection type
   * @example "4g"
   */
  @ApiPropertyOptional({ description: 'Effective connection type', example: '4g' })
  @IsOptional()
  @IsString()
  effectiveType?: string;

  /**
   * @description_zh 下行速度 (Mbps)
   * @description_en Downlink speed in Mbps
   * @example 10
   */
  @ApiPropertyOptional({ description: 'Downlink speed in Mbps', example: 10 })
  @IsOptional()
  @IsNumber()
  downlink?: number;

  /**
   * @description_zh 往返时间 (ms)
   * @description_en Round-trip time in ms
   * @example 50
   */
  @ApiPropertyOptional({ description: 'Round-trip time in ms', example: 50 })
  @IsOptional()
  @IsNumber()
  rtt?: number;
}

/**
 * Report Event DTO
 * 
 * @description_zh 事件上报主数据对象
 * @description_en Main event report data object
 * @description_ja イベントレポートメインデータ
 * @description_tw 事件上報主資料物件
 */
export class ReportEventDto {
  /**
   * @description_zh 事件类型
   * @description_en Event type
   */
  @ApiProperty({ enum: EventType, description: 'Event type', example: EventType.ERROR })
  @IsEnum(EventType)
  type: EventType;

  /**
   * @description_zh 事件级别
   * @description_en Event severity level
   */
  @ApiProperty({ enum: EventLevel, description: 'Event severity level', example: EventLevel.ERROR })
  @IsEnum(EventLevel)
  level: EventLevel;

  /**
   * @description_zh 错误消息
   * @description_en Error message
   */
  @ApiProperty({ description: 'Error message', example: 'Uncaught TypeError: Cannot read property' })
  @IsString()
  message: string;

  /**
   * @description_zh 错误堆栈
   * @description_en Error stack trace
   */
  @ApiPropertyOptional({ description: 'Error stack trace' })
  @IsOptional()
  @IsString()
  stack?: string;

  /**
   * @description_zh 用户ID
   * @description_en User identifier
   */
  @ApiPropertyOptional({ description: 'User identifier' })
  @IsOptional()
  @IsString()
  userId?: string;

  /**
   * @description_zh 会话ID
   * @description_en Session identifier
   */
  @ApiProperty({ description: 'Session identifier' })
  @IsString()
  sessionId: string;

  /**
   * @description_zh 页面URL
   * @description_en Page URL
   */
  @ApiProperty({ description: 'Page URL', example: 'https://example.com/page' })
  @IsString()
  pageUrl: string;

  /**
   * @description_zh 应用版本
   * @description_en Application version
   */
  @ApiPropertyOptional({ description: 'Application version', example: '1.0.0' })
  @IsOptional()
  @IsString()
  appVersion?: string;

  /**
   * @description_zh 运行环境
   * @description_en Runtime environment
   */
  @ApiPropertyOptional({ description: 'Runtime environment', example: 'production' })
  @IsOptional()
  @IsString()
  environment?: string;

  /**
   * @description_zh 自定义标签
   * @description_en Custom tags
   */
  @ApiPropertyOptional({ description: 'Custom tags' })
  @IsOptional()
  @IsObject()
  tags?: Record<string, string>;

  /**
   * @description_zh 面包屑列表
   * @description_en Breadcrumb list
   */
  @ApiProperty({ type: [BreadcrumbDto], description: 'Breadcrumb list' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreadcrumbDto)
  breadcrumbs: BreadcrumbDto[];

  /**
   * @description_zh 设备信息
   * @description_en Device information
   */
  @ApiProperty({ type: DeviceDto, description: 'Device information' })
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  /**
   * @description_zh 网络信息
   * @description_en Network information
   */
  @ApiPropertyOptional({ type: NetworkDto, description: 'Network information' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NetworkDto)
  network?: NetworkDto;

  /**
   * @description_zh 事件时间戳
   * @description_en Event timestamp
   */
  @ApiProperty({ description: 'Event timestamp in milliseconds', example: 1704067200000 })
  @IsNumber()
  timestamp: number;

  /**
   * @description_zh 额外数据
   * @description_en Extra data
   */
  @ApiPropertyOptional({ description: 'Extra data' })
  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;
}
