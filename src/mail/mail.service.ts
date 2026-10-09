import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Result } from 'src/common/interfaces/result';
import { SendMailDto } from './dto/send-mail.dto';
import { MailTemplateService } from './mail-template.servide';

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly templateService: MailTemplateService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false, // true para 465, false para otros puertos como 587
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Contraseña de aplicación de Google
      },
    });
  }

  async enviarCorreo(dto: SendMailDto): Promise<Result<boolean>> {
    try {
      // 1. Renderizamos el HTML usando el template y el contexto del DTO
      const html = this.templateService.render(dto.plantilla, dto.contexto || {});

      // 2. Enviamos el correo usando el transporter
      await this.transporter.sendMail({
        from: dto.from || `"Obrix App" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
        to: dto.to,
        subject: dto.subject || 'Notificación del sistema', // Asegúrate de agregarlo al DTO si lo necesitas
        html,
      });

      // 3. Si todo sale bien, retornamos éxito con Result.ok
      return Result.ok(true, 'Correo enviado exitosamente');
      
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      // Si ocurre una excepción, retornamos un fallo controlado
      return Result.fallo<boolean>(`No se pudo enviar el correo: ${error}`);
    }
  }
}