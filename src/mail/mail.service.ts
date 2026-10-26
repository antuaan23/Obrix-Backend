import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Result } from 'src/common/interfaces/result';
import { SendMailDto } from './dto/send-mail.dto';
import { MailTemplateService } from './mail-template.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly templateService: MailTemplateService,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: Number(this.configService.get<number | string>('MAIL_PORT')) || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async enviarCorreo(dto: SendMailDto): Promise<Result<boolean>> {
    try {
      const html = this.templateService.render(dto.plantilla, dto.contexto || {});
      const mailUser = this.configService.get<string>('MAIL_USER');
      const defaultFrom =
        this.configService.get<string>('MAIL_FROM') ||
        `"Obrix Corporation" <${mailUser}>`;
      const from = dto.from || defaultFrom;

      await this.transporter.sendMail({
        from,
        to: dto.to,
        subject: dto.subject || 'Notificación Obrix',
        html
      });

      return Result.ok(true, 'Correo enviado exitosamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`No se pudo enviar el correo: ${message}`);
      return Result.fallo<boolean>(`No se pudo enviar el correo: ${message}`);
    }
  }
}
