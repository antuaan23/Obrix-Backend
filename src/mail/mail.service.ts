import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Result } from 'src/common/interfaces/result';
import { SendMailDto } from './dto/send-mail.dto';
import { MailTemplateService } from './mail-template.servide';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly templateService: MailTemplateService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async enviarCorreo(dto: SendMailDto): Promise<Result<boolean>> {
    try {
      const html = this.templateService.render(dto.plantilla, dto.contexto || {});
      const from =
        dto.from ||
        process.env.MAIL_FROM ||
        `"Obrix Corporation" <${process.env.MAIL_USER}>`;

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
