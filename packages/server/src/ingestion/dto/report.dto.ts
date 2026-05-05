/**
 * 上报 DTO
 * Report DTO
 * レポート DTO
 * 上報 DTO
 */

import {
  IsString,
  IsArray,
  IsObject,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class EventDataDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  subType?: string;

  @IsObject()
  data: any;

  @IsNumber()
  timestamp: number;

  @IsOptional()
  @IsArray()
  breadcrumbs?: any[];
}

class DeviceDto {
  @IsString()
  browser: string;

  @IsString()
  browserVersion: string;

  @IsString()
  os: string;

  @IsString()
  osVersion: string;

  @IsString()
  deviceType: string;

  @IsString()
  screenResolution: string;

  @IsString()
  language: string;

  @IsString()
  timezone: string;
}

class NetworkDto {
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

export class ReportDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  pageUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventDataDto)
  events: EventDataDto[];

  @ValidateNested()
  @Type(() => DeviceDto)
  device: DeviceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NetworkDto)
  network?: NetworkDto;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  environment?: string;
}
