import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { AlertEvent } from '../alert.service';

@Injectable()
export class EmailNotifier {
  private readonly logger = new Logger(EmailNotifier.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email notifier initialized');
    } else {
      this.logger.warn('Email configuration missing');
    }
  }

  async send(event: AlertEvent): Promise<void> {
    if (!this.transporter) return;

    try {
      const to = this.configService.get<string>('ALERT_EMAIL_TO');
      if (!to) return;

      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || 'noreply@rewind.dev',
        to,
        subject: `[Rewind] ${event.level.toUpperCase()}: ${event.title}`,
        html: `<h2>Alert</h2><p>${event.message}</p><a href="${event.url}">View</a>`,
      });

      this.logger.log(`Email sent for issue ${event.issueId}`);
    } catch (error) {
      this.logger.error(`Email failed: ${error.message}`);
    }
  }
}
