import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.MAIL_PORT) || 2525,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async enviarCorreo(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"Obrix App" <${process.env.MAIL_FROM || 'no-reply@obrix.com'}>`,
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      return false;
    }
  }
}