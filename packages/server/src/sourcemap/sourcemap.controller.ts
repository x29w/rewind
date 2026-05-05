/**
 * Sourcemap 控制器
 * Sourcemap Controller
 * Sourcemap コントローラー
 * Sourcemap 控制器
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SourcemapService } from './sourcemap.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('api/v1/sourcemap')
export class SourcemapController {
  constructor(private readonly sourcemapService: SourcemapService) {}

  /**
   * 上传 SourceMap
   * Upload Sourcemap
   * SourceMap をアップロード
   * 上傳 SourceMap
   *
   * @description_zh 上传 SourceMap 文件（使用 API Key 认证）
   * @description_en Upload sourcemap file (using API Key authentication)
   * @description_ja SourceMap ファイルをアップロード（API キー認証を使用）
   * @description_tw 上傳 SourceMap 檔案（使用 API Key 認證）
   */
  @Post()
  @UseGuards(ApiKeyGuard)
  async upload(
    @Body()
    body: {
      projectId: string;
      appVersion: string;
      fileName: string;
      content: string;
    },
  ) {
    return this.sourcemapService.upload(body);
  }

  /**
   * 获取项目的 SourceMap 列表
   * Get Project Sourcemaps
   * プロジェクトの SourceMap リストを取得
   * 取得專案的 SourceMap 列表
   *
   * @description_zh 获取指定项目的所有 SourceMap（使用 JWT 认证）
   * @description_en Get all sourcemaps of specified project (using JWT authentication)
   * @description_ja 指定されたプロジェクトのすべての SourceMap を取得（JWT 認証を使用）
   * @description_tw 取得指定專案的所有 SourceMap（使用 JWT 認證）
   */
  @Get('projects/:projectId')
  @UseGuards(JwtAuthGuard)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('appVersion') appVersion?: string,
  ) {
    return this.sourcemapService.findByProject({ projectId, appVersion });
  }
}
