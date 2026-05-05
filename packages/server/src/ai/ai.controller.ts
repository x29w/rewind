/**
 * AI 控制器
 * AI Controller
 * AI コントローラー
 * AI 控制器
 */

import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyGuard } from '../guards/api-key.guard';

@Controller('api/v1/ai')
@UseGuards(ApiKeyGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 分析 Issue
   * Analyze Issue
   * Issue を分析
   * 分析 Issue
   */
  @Post('analyze/:issueId')
  async analyzeIssue(@Param('issueId') issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        events: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!issue || issue.events.length === 0) {
      return { success: false, message: 'Issue not found' };
    }

    const event = issue.events[0];
    const analysis = await this.aiService.analyzeError(
      issue.message,
      issue.stack || '',
      event.breadcrumbs as any[],
      event.device as any,
    );

    if (!analysis) {
      return { success: false, message: 'AI analysis not available' };
    }

    // 保存分析结果到数据库
    // Save analysis result to database
    // 分析結果をデータベースに保存
    // 儲存分析結果至資料庫
    await this.prisma.issue.update({
      where: { id: issueId },
      data: {
        tags: {
          ...(issue.tags as any),
          aiAnalysis: analysis,
          analyzedAt: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      analysis,
    };
  }

  /**
   * 获取 Issue 分析结果
   * Get Issue analysis
   * Issue 分析を取得
   * 取得 Issue 分析
   */
  @Get('analysis/:issueId')
  async getAnalysis(@Param('issueId') issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      select: { tags: true },
    });

    if (!issue) {
      return { success: false, message: 'Issue not found' };
    }

    const tags = issue.tags as any;
    const analysis = tags?.aiAnalysis;

    if (!analysis) {
      return { success: false, message: 'No analysis available' };
    }

    return {
      success: true,
      analysis,
      analyzedAt: tags?.analyzedAt,
    };
  }

  /**
   * 查找相似问题
   * Find similar issues
   * 類似の問題を検索
   * 查找相似問題
   */
  @Post('similar/:issueId')
  async findSimilar(@Param('issueId') issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return { success: false, message: 'Issue not found' };
    }

    const similar = await this.aiService.findSimilarIssues(
      issue.message,
      issue.stack || '',
    );

    return {
      success: true,
      similar,
    };
  }
}
