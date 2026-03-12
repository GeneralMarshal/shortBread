import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { WebhookPayload } from 'src/urls/urls.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    this.from = this.configService.get('EMAIL_FROM') ?? 'deVoid@shortbread.com';
  }

  async sendClickEmail(to: string, data: WebhookPayload) {
    const { shortCode, longUrl, clickedAt, meta } = data;

    const formattedDate = new Date(clickedAt).toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Short link clicked</title>
          </head>
          <body style="font-family: -apple-system, system-ui, sans-serif; background:#ffffff; color:#111827; padding:24px;">
            <h2 style="margin:0 0 12px;">Your short link was clicked</h2>
            <p style="margin:0 0 16px; font-size:14px; color:#4b5563;">
              On ${formattedDate} (UTC)
            </p>
            <p style="margin:0 0 8px; font-size:14px;">
              <strong>Short code:</strong> <code>${shortCode}</code>
            </p>
            <p style="margin:0 0 8px; font-size:14px;">
              <strong>Destination:</strong>
              <a href="${longUrl}" style="color:#2563eb; text-decoration:none;">
                ${longUrl}
              </a>
            </p>
            <p style="margin:16px 0 4px; font-size:13px; color:#6b7280;">
              Click details:
            </p>
            <p style="margin:0 0 4px; font-size:13px;">
              <strong>IP:</strong> ${meta.ip}
            </p>
            ${
              meta.country
                ? `<p style="margin:0 0 4px; font-size:13px;"><strong>Country:</strong> ${meta.country}</p>`
                : ''
            }
            ${
              meta.referrer
                ? `<p style="margin:0 0 4px; font-size:13px;"><strong>Referrer:</strong> ${meta.referrer}</p>`
                : ''
            }
            <p style="margin:20px 0 0; font-size:12px; color:#9ca3af;">
              You’re receiving this because you own this short URL.
            </p>
          </body>
        </html>
    `;

    try {
      this.logger.log(
        `sending click email to=${to} shortCode=${shortCode}`,
      );
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: `Shortbread click: ${shortCode}`,
        html,
      });
    } catch (error) {
      this.logger.error(
        `email send failed for ${to} (shortCode=${shortCode})`,
        error,
      );
    }
  }
}
