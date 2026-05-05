/**
 * Sourcemap 服务
 * Sourcemap Service
 * Sourcemap サービス
 * Sourcemap 服務
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class SourcemapService {
  private readonly storagePath: string;

  constructor(private readonly prisma: PrismaService) {
    this.storagePath =
      process.env.SOURCEMAP_STORAGE_PATH || './storage/sourcemaps';
  }

  /**
   * 上传 SourceMap
   * Upload Sourcemap
   * SourceMap をアップロード
   * 上傳 SourceMap
   *
   * @description_zh 保存 SourceMap 文件到数据库和文件系统
   * @description_en Save sourcemap file to database and filesystem
   * @description_ja SourceMap ファイルをデータベースとファイルシステムに保存
   * @description_tw 儲存 SourceMap 檔案到資料庫和檔案系統
   */
  async upload({
    projectId,
    appVersion,
    fileName,
    content,
  }: {
    projectId: string;
    appVersion: string;
    fileName: string;
    content: string;
  }) {
    // 保存到数据库
    const sourcemap = await this.prisma.sourcemap.upsert({
      where: {
        projectId_appVersion_fileName: {
          projectId,
          appVersion,
          fileName,
        },
      },
      create: {
        projectId,
        appVersion,
        fileName,
        content,
      },
      update: {
        content,
      },
    });

    // 保存到文件系统（可选，用于备份）
    try {
      const dirPath = join(this.storagePath, projectId, appVersion);
      await mkdir(dirPath, { recursive: true });
      await writeFile(join(dirPath, fileName), content);
    } catch (error) {
      console.error('Failed to save sourcemap to filesystem:', error);
    }

    return sourcemap;
  }

  /**
   * 获取 SourceMap
   * Get Sourcemap
   * SourceMap を取得
   * 取得 SourceMap
   *
   * @description_zh 根据项目、版本和文件名获取 SourceMap
   * @description_en Get sourcemap by project, version and filename
   * @description_ja プロジェクト、バージョン、ファイル名で SourceMap を取得
   * @description_tw 根據專案、版本和檔案名稱取得 SourceMap
   */
  async findOne({
    projectId,
    appVersion,
    fileName,
  }: {
    projectId: string;
    appVersion: string;
    fileName: string;
  }) {
    return this.prisma.sourcemap.findUnique({
      where: {
        projectId_appVersion_fileName: {
          projectId,
          appVersion,
          fileName,
        },
      },
    });
  }

  /**
   * 获取项目的所有 SourceMap
   * Get Project Sourcemaps
   * プロジェクトのすべての SourceMap を取得
   * 取得專案的所有 SourceMap
   *
   * @description_zh 获取指定项目和版本的所有 SourceMap
   * @description_en Get all sourcemaps of specified project and version
   * @description_ja 指定されたプロジェクトとバージョンのすべての SourceMap を取得
   * @description_tw 取得指定專案和版本的所有 SourceMap
   */
  async findByProject({
    projectId,
    appVersion,
  }: {
    projectId: string;
    appVersion?: string;
  }) {
    const where: any = { projectId };
    if (appVersion) {
      where.appVersion = appVersion;
    }

    return this.prisma.sourcemap.findMany({
      where,
      select: {
        id: true,
        appVersion: true,
        fileName: true,
        fileUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 删除旧版本 SourceMap
   * Delete Old Sourcemaps
   * 古いバージョンの SourceMap を削除
   * 刪除舊版本 SourceMap
   *
   * @description_zh 删除指定天数之前的 SourceMap（定时任务调用）
   * @description_en Delete sourcemaps older than specified days (called by cron job)
   * @description_ja 指定日数より古い SourceMap を削除（cron ジョブから呼び出し）
   * @description_tw 刪除指定天數之前的 SourceMap（定時任務呼叫）
   */
  async deleteOld({ days = 90 }: { days?: number }) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.sourcemap.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return { deleted: result.count };
  }
}
