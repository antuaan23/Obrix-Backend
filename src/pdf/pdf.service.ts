import {
  Injectable,
  InternalServerErrorException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import * as Handlebars from 'handlebars';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
  private browser!: Browser;

  async onModuleInit() {
    if (!Handlebars.helpers['clp']) {
      Handlebars.registerHelper('clp', (value: unknown) => {
        const n = Number(value) || 0;
        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          maximumFractionDigits: 0,
        }).format(n);
      });
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async generatePdf(templateHtml: string, data: Record<string, unknown>): Promise<Buffer> {
    try {
      const template = Handlebars.compile(templateHtml);
      const htmlContent = template(data);
      const page = await this.browser.newPage();

      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '18mm', right: '14mm', bottom: '18mm', left: '14mm' },
      });

      await page.close();
      return Buffer.from(pdfBuffer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Error al generar el PDF', message);
    }
  }
}
