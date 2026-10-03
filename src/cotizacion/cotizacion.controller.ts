import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CotizacionService } from './cotizacion.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Cotizacion } from './entities/cotizacion.entity';
import { Result } from 'src/common/interfaces/result';

@ApiTags('cotizaciones')
@Controller('cotizacion')
export class CotizacionController {
  constructor(private readonly cotizacionService: CotizacionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva cotización para un proyecto',
    description:
      'Al crear la cotización se recalcula automáticamente el presupuesto del proyecto (suma de todas sus cotizaciones).',
  })
  @ApiResponse({ status: 201, description: 'Cotización creada exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o recurso no encontrado (Proyecto/Material).',
  })
  async create(@Body() createCotizacionDto: CreateCotizacionDto): Promise<Result<Cotizacion>> {
    return await this.cotizacionService.crearCotizacion(createCotizacionDto);
  }

  @Get('proyecto/:proyectoUuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las cotizaciones asociadas a un proyecto' })
  @ApiResponse({
    status: 200,
    description: 'Lista de cotizaciones del proyecto obtenida exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'El proyecto no existe o no se encontraron cotizaciones.',
  })
  async obtenerPorProyecto(
    @Param('proyectoUuid', new ParseUUIDPipe()) proyectoUuid: string,
  ): Promise<Result<Cotizacion[]>> {
    return await this.cotizacionService.obtenerPorProyectoUuid(proyectoUuid);
  }

  /**
   * Front: botón "Exportar PDF" → GET /api/cotizacion/{uuid}/pdf
   * Respuesta: application/pdf (descarga).
   */
  @Get(':uuid/pdf')
  @ApiOperation({
    summary: 'Exportar una cotización a PDF',
    description:
      'Devuelve el archivo PDF de esa cotización. Usar el UUID de la cotización. El front puede abrir la URL o descargar el blob.',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente.' })
  @ApiResponse({ status: 404, description: 'La cotización no existe.' })
  async exportCotizacionPdf(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { pdfBuffer, nombreArchivo } = await this.cotizacionService.generarPdfPorUuid(uuid);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }
}
