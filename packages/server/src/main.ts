/**
 * Server Entry Point
 * 
 * @description_zh 服务器入口文件
 * @description_en Server entry point file
 * @description_ja サーバーエントリーポイントファイル
 * @description_tw 伺服器進入點檔案
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap Application
 * 
 * @description_zh 启动应用程序
 * @description_en Bootstrap the application
 * @description_ja アプリケーションを起動
 * @description_tw 啟動應用程式
 */
const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });
  
  // Swagger API Documentation (Knife4j style)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Rewind API Documentation')
      .setDescription('Rewind 智能前端监控平台 API 文档 | Intelligent Frontend Monitoring Platform API')
      .setVersion('0.1.0')
      .addTag('ingestion', '事件上报 Event Ingestion')
      .addTag('ai', 'AI 分析 AI Analysis')
      .addTag('alert', '智能告警 Smart Alerting')
      .addTag('health', '健康检查 Health Check')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for event ingestion',
        },
        'API-Key',
      )
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    
    // Knife4j style Swagger UI options
    SwaggerModule.setup('api-docs', app, document, {
      customSiteTitle: 'Rewind API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
        .swagger-ui .info .title { font-size: 32px; font-weight: bold }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'list',
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
      },
    });
    
    console.log(`📚 API Documentation: http://localhost:${process.env.PORT || 3000}/api-docs`);
  }
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Server is running on: http://localhost:${port}`);
};

bootstrap();
