import { Injectable, InternalServerErrorException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { CotizacionPdfData } from './cotizacion-pdf.types';

/**
 * Genera PDFs en Node con PDFKit (sin Chrome / Puppeteer).
 * Eso cabe en Fly.io (256 MB) y no requiere binarios extra en el Dockerfile.
 */
@Injectable()
export class PdfService {
  async generateCotizacionPdf(data: CotizacionPdfData): Promise<Buffer> {
    try {
      return await this.buildCotizacionDocument(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Error al generar el PDF', message);
    }
  }

  private buildCotizacionDocument(data: CotizacionPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const left = 48;
      const right = pageWidth - 48;
      const contentWidth = right - left;
      const accent = '#0284c7';
      const muted = '#64748b';
      const ink = '#0f172a';

      const col = {
        desc: { x: left, w: contentWidth * 0.46 },
        qty: { x: left + contentWidth * 0.46, w: contentWidth * 0.12 },
        unit: { x: left + contentWidth * 0.58, w: contentWidth * 0.21 },
        total: { x: left + contentWidth * 0.79, w: contentWidth * 0.21 },
      };

      doc.fillColor(ink).font('Helvetica-Bold').fontSize(20).text('OBRIX', left, 48);
      doc.font('Helvetica').fontSize(10).fillColor(muted).text('Cotización de obra', left, 72);

      doc.font('Helvetica').fontSize(10).fillColor(ink);
      doc.text(`Documento: ${data.codigo}`, left, 48, { align: 'right', width: contentWidth });
      doc.fillColor(muted).text(`Fecha: ${data.fecha}`, left, 64, {
        align: 'right',
        width: contentWidth,
      });

      doc.moveTo(left, 96).lineTo(right, 96).lineWidth(2).strokeColor(accent).stroke();

      let y = 114;
      doc.fillColor(ink).font('Helvetica').fontSize(11);
      y = this.metaLine(doc, 'Cotización', data.nombreCotizacion, left, y, contentWidth);
      y = this.metaLine(doc, 'Proyecto', data.proyectoNombre, left, y, contentWidth);
      y = this.metaLine(doc, 'Cliente', data.clienteNombre, left, y, contentWidth);

      y += 16;
      this.drawTableHeader(doc, col, y, accent);
      y += 24;

      for (const item of data.items) {
        doc.font('Helvetica').fontSize(9);
        const nameHeight = Math.max(
          16,
          doc.heightOfString(item.name, { width: col.desc.w - 8, align: 'left' }),
        );
        const rowHeight = nameHeight + 10;

        if (y + rowHeight > doc.page.height - 90) {
          doc.addPage();
          y = 48;
          this.drawTableHeader(doc, col, y, accent);
          y += 24;
        }

        doc.rect(left, y, contentWidth, rowHeight).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
        doc.font('Helvetica').fontSize(9).fillColor(ink);
        doc.text(item.name, col.desc.x + 4, y + 5, { width: col.desc.w - 8 });
        doc.text(String(item.quantity), col.qty.x, y + 5, { width: col.qty.w - 4, align: 'right' });
        doc.text(this.formatClp(item.unitPrice), col.unit.x, y + 5, {
          width: col.unit.w - 4,
          align: 'right',
        });
        doc.text(this.formatClp(item.total), col.total.x, y + 5, {
          width: col.total.w - 4,
          align: 'right',
        });

        y += rowHeight;
      }

      y += 20;
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 48;
      }

      const totalBoxWidth = 220;
      const totalBoxX = right - totalBoxWidth;
      doc.moveTo(totalBoxX, y).lineTo(right, y).lineWidth(1.5).strokeColor(accent).stroke();
      doc.font('Helvetica-Bold').fontSize(12).fillColor(accent);
      doc.text('Total', totalBoxX, y + 10, { width: 80 });
      doc.text(this.formatClp(data.total), totalBoxX + 80, y + 10, {
        width: totalBoxWidth - 80,
        align: 'right',
      });

      const footerY = doc.page.height - 48;
      doc.font('Helvetica').fontSize(8).fillColor(muted);
      doc.text(
        'Documento generado automáticamente por Obrix. Montos expresados en pesos chilenos (CLP).',
        left,
        footerY,
        { width: contentWidth, align: 'center' },
      );

      doc.end();
    });
  }

  private metaLine(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
    x: number,
    y: number,
    width: number,
  ): number {
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${label}: `, x, y, {
      continued: true,
      width,
    });
    doc.font('Helvetica').fillColor('#334155').text(value);
    return y + 16;
  }

  private drawTableHeader(
    doc: PDFKit.PDFDocument,
    col: {
      desc: { x: number; w: number };
      qty: { x: number; w: number };
      unit: { x: number; w: number };
      total: { x: number; w: number };
    },
    y: number,
    accent: string,
  ) {
    const left = col.desc.x;
    const width = col.total.x + col.total.w - left;
    doc.rect(left, y, width, 22).fillColor('#f1f5f9').fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#334155');
    doc.text('DESCRIPCIÓN / MATERIAL', col.desc.x + 4, y + 7, { width: col.desc.w - 8 });
    doc.text('CANT.', col.qty.x, y + 7, { width: col.qty.w - 4, align: 'right' });
    doc.text('P. UNITARIO', col.unit.x, y + 7, { width: col.unit.w - 4, align: 'right' });
    doc.text('TOTAL', col.total.x, y + 7, { width: col.total.w - 4, align: 'right' });
    doc.moveTo(left, y + 22).lineTo(left + width, y + 22).lineWidth(1).strokeColor(accent).stroke();
  }

  private formatClp(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
