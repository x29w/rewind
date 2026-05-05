/**
 * API Key 守卫
 * API Key Guard
 * API キーガード
 * API Key 守衛
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 验证 API Key
   * Validate API Key
   * API キーを検証
   * 驗證 API Key
   *
   * @description_zh 从请求头中提取 API Key 并验证
   * @description_en Extract and validate API Key from request headers
   * @description_ja リクエストヘッダーから API キーを抽出して検証
   * @description_tw 從請求標頭中提取 API Key 並驗證
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API Key is required');
    }

    const project = await this.prisma.project.findUnique({
      where: { apiKey },
      select: {
        id: true,
        name: true,
        settings: true,
      },
    });

    if (!project) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // 将项目信息附加到请求对象
    request.project = project;

    return true;
  }

  /**
   * 提取 API Key
   * Extract API Key
   * API キーを抽出
   * 提取 API Key
   */
  private extractApiKey(request: any): string | undefined {
    // 从 Authorization header 提取：Authorization: Bearer <api-key>
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 从 X-API-Key header 提取
    return request.headers['x-api-key'];
  }
}
