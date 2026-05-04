/**
 * Server 入口文件
 * Server Entry Point
 * サーバーエントリーポイント
 * 伺服器入口檔案
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * 启动应用
 * Bootstrap application
 * アプリケーションを起動
 * 啟動應用
 */
const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  
  // 全局验证管道
  // Global validation pipe
  // グローバル検証パイプ
  // 全域驗證管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // 启用 CORS
  // Enable CORS
  // CORS を有効化
  // 啟用 CORS
  app.enableCors();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Server is running on: http://localhost:${port}`);
};

bootstrap();
