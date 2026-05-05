/**
 * Alert 控制器
 * Alert Controller
 * Alert コントローラー
 * Alert 控制器
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import {
  CreateAlertRuleDto,
  UpdateAlertRuleDto,
  QueryAlertRulesDto,
  QueryAlertHistoryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  /**
   * 创建告警规则
   * Create Alert Rule
   * アラートルールを作成
   * 建立告警規則
   *
   * @description_zh 为项目创建新的告警规则
   * @description_en Create new alert rule for project
   * @description_ja プロジェクトの新しいアラートルールを作成
   * @description_tw 為專案建立新的告警規則
   */
  @Post('projects/:projectId/alert-rules')
  async createRule(
    @Param('projectId') projectId: string,
    @Body() dto: CreateAlertRuleDto,
  ) {
    return this.alertService.createRule({ projectId, dto });
  }

  /**
   * 获取告警规则列表
   * Get Alert Rules
   * アラートルールリストを取得
   * 取得告警規則列表
   *
   * @description_zh 获取项目的所有告警规则
   * @description_en Get all alert rules of project
   * @description_ja プロジェクトのすべてのアラートルールを取得
   * @description_tw 取得專案的所有告警規則
   */
  @Get('projects/:projectId/alert-rules')
  async findAllRules(
    @Param('projectId') projectId: string,
    @Query() dto: QueryAlertRulesDto,
  ) {
    return this.alertService.findAllRules({ projectId, dto });
  }

  /**
   * 获取告警规则详情
   * Get Alert Rule Detail
   * アラートルール詳細を取得
   * 取得告警規則詳情
   *
   * @description_zh 获取单个告警规则的详细信息
   * @description_en Get detailed information of single alert rule
   * @description_ja 単一のアラートルールの詳細情報を取得
   * @description_tw 取得單個告警規則的詳細資訊
   */
  @Get('alert-rules/:id')
  async findOneRule(@Param('id') ruleId: string) {
    return this.alertService.findOneRule({ ruleId });
  }

  /**
   * 更新告警规则
   * Update Alert Rule
   * アラートルールを更新
   * 更新告警規則
   *
   * @description_zh 更新告警规则的配置
   * @description_en Update alert rule configuration
   * @description_ja アラートルールの設定を更新
   * @description_tw 更新告警規則的設定
   */
  @Patch('alert-rules/:id')
  async updateRule(
    @Param('id') ruleId: string,
    @Body() dto: UpdateAlertRuleDto,
  ) {
    return this.alertService.updateRule({ ruleId, dto });
  }

  /**
   * 删除告警规则
   * Delete Alert Rule
   * アラートルールを削除
   * 刪除告警規則
   *
   * @description_zh 删除指定的告警规则
   * @description_en Delete specified alert rule
   * @description_ja 指定されたアラートルールを削除
   * @description_tw 刪除指定的告警規則
   */
  @Delete('alert-rules/:id')
  async deleteRule(@Param('id') ruleId: string) {
    return this.alertService.deleteRule({ ruleId });
  }

  /**
   * 获取告警历史
   * Get Alert History
   * アラート履歴を取得
   * 取得告警歷史
   *
   * @description_zh 获取项目的告警触发历史
   * @description_en Get alert trigger history of project
   * @description_ja プロジェクトのアラートトリガー履歴を取得
   * @description_tw 取得專案的告警觸發歷史
   */
  @Get('projects/:projectId/alert-history')
  async findHistory(
    @Param('projectId') projectId: string,
    @Query() dto: QueryAlertHistoryDto,
  ) {
    return this.alertService.findHistory({ projectId, dto });
  }
}
