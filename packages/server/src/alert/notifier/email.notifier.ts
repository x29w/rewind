/**
 * 邮件通知器
 * Email Notifier
 * メール通知
 * 郵件通知器
 */

import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { INotifier } from './notifier.interface';

@Injectable()
export class EmailNotifier implements INotifier {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  /**
   * 初始化邮件传输器
   * Initialize Email Transporter
   * メールトランスポーターを初期化
   * 初始化郵件傳輸器
   */
  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) {
      console.warn('SMTP configuration not found, email notifications disabled');
      return;
    }

    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  /**
   * 发送邮件通知
   * Send Email Notification
   * メール通知を送信
   * 發送郵件通知
   *
   * @description_zh 发送告警邮件到指定收件人
   * @description_en Send alert email to specified recipients
   * @description_ja 指定された受信者にアラートメールを送信
   * @description_tw 發送告警郵件到指定收件人
   */
  async send({
    title,
    message,
    to,
  }: {
    title: string;
    message: string;
    to?: string[];
  }): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    if (!to || to.length === 0) {
      throw new Error('Email recipients are required');
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    await this.transporter.sendMail({
      from,
      to: to.join(', '),
      subject: title,
      text: message,
      html: this.formatHtml({ title, message }),
    });
  }

  /**
   * 格式化 HTML 邮件
   * Format HTML Email
   * HTML メールをフォーマット
   * 格式化 HTML 郵件
   */
  private formatHtml({
    title,
    message,
  }: {
    title: string;
    message: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⚠️ ${title}</h2>
            </div>
            <div class="content">
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="footer">
              <p>此邮件由 Rewind 监控系统自动发送，请勿回复。</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
