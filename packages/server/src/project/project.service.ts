/**
 * 项目服务
 * Project Service
 * プロジェクトサービス
 * 專案服務
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建项目
   * Create Project
   * プロジェクトを作成
   * 建立專案
   */
  async create(userId: string, dto: CreateProjectDto) {
    // 生成 API Key
    const apiKey = this.generateApiKey();

    // 创建项目
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        apiKey,
        settings: dto.settings || {},
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return project;
  }

  /**
   * 获取用户的所有项目
   * Get User Projects
   * ユーザーのプロジェクトを取得
   * 取得使用者專案
   */
  async findAllByUser(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            issues: true,
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }

  /**
   * 获取项目详情
   * Get Project Detail
   * プロジェクト詳細を取得
   * 取得專案詳情
   */
  async findOne(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            issues: true,
            events: true,
            sourcemaps: true,
            alertRules: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 检查用户是否有权限访问
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  /**
   * 更新项目
   * Update Project
   * プロジェクトを更新
   * 更新專案
   */
  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    // 检查权限
    await this.checkPermission(projectId, userId, ['owner', 'admin']);

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        description: dto.description,
        settings: dto.settings,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return project;
  }

  /**
   * 删除项目
   * Delete Project
   * プロジェクトを削除
   * 刪除專案
   */
  async remove(projectId: string, userId: string) {
    // 只有 owner 可以删除项目
    await this.checkPermission(projectId, userId, ['owner']);

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  }

  /**
   * 重新生成 API Key
   * Regenerate API Key
   * API キーを再生成
   * 重新生成 API Key
   */
  async regenerateApiKey(projectId: string, userId: string) {
    // 只有 owner 可以重新生成 API Key
    await this.checkPermission(projectId, userId, ['owner']);

    const newApiKey = this.generateApiKey();

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: { apiKey: newApiKey },
      select: {
        id: true,
        name: true,
        apiKey: true,
      },
    });

    return project;
  }

  /**
   * 通过 API Key 查找项目
   * Find Project by API Key
   * API キーでプロジェクトを検索
   * 透過 API Key 尋找專案
   */
  async findByApiKey(apiKey: string) {
    const project = await this.prisma.project.findUnique({
      where: { apiKey },
      select: {
        id: true,
        name: true,
        settings: true,
      },
    });

    return project;
  }

  /**
   * 检查用户权限
   * Check User Permission
   * ユーザー権限を確認
   * 檢查使用者權限
   */
  private async checkPermission(
    projectId: string,
    userId: string,
    allowedRoles: string[],
  ) {
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return member;
  }

  /**
   * 生成 API Key
   * Generate API Key
   * API キーを生成
   * 生成 API Key
   */
  private generateApiKey(): string {
    return `rw_${randomBytes(32).toString('hex')}`;
  }
}
