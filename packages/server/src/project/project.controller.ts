/**
 * 项目控制器
 * Project Controller
 * プロジェクトコントローラー
 * 專案控制器
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/v1/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * 创建项目
   * Create Project
   * プロジェクトを作成
   * 建立專案
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.create(userId, dto);
  }

  /**
   * 获取用户的所有项目
   * Get User Projects
   * ユーザーのプロジェクトを取得
   * 取得使用者專案
   */
  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.projectService.findAllByUser(userId);
  }

  /**
   * 获取项目详情
   * Get Project Detail
   * プロジェクト詳細を取得
   * 取得專案詳情
   */
  @Get(':id')
  async findOne(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.findOne(projectId, userId);
  }

  /**
   * 更新项目
   * Update Project
   * プロジェクトを更新
   * 更新專案
   */
  @Patch(':id')
  async update(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(projectId, userId, dto);
  }

  /**
   * 删除项目
   * Delete Project
   * プロジェクトを削除
   * 刪除專案
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.remove(projectId, userId);
  }

  /**
   * 重新生成 API Key
   * Regenerate API Key
   * API キーを再生成
   * 重新生成 API Key
   */
  @Post(':id/regenerate-api-key')
  async regenerateApiKey(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.regenerateApiKey(projectId, userId);
  }
}
