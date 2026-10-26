import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  StreamableFile,
  Res,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CotizacionService } from './cotizacion.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';

@ApiTags('Cotizaciones')
@Controller(['cotizacion', 'cotizaciones'])
export class CotizacionController {
  constructor(private readonly cotizacionService: CotizacionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva cotización para un proyecto',
    description:
      'Registra la cotización en el proyecto sin sobreescribir ni fijar el presupuesto automáticamente.',
  })
  @ApiResponse({ status: 201, description: 'Cotización creada exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o recurso no encontrado (Proyecto/Material).',
  })
  async create(@Body() createCotizacionDto: CreateCotizacionDto) {
    const res = await this.cotizacionService.crearCotizacion(createCotizacionDto);

    if (!res.exitoso) {
      throw new BadRequestException({
        exitoso: res.exitoso,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
      _resultado: res.resultado,
    };
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
  ) {
    const res = await this.cotizacionService.obtenerPorProyectoUuid(proyectoUuid);

    if (!res.exitoso) {
      throw new NotFoundException({
        exitoso: res.exitoso,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
      _resultado: res.resultado,
    };
  }

  /**
   * Front: botón "Calcular Presupuesto" → POST o PATCH /api/cotizacion/proyecto/{proyectoUuid}/calcular-presupuesto
   * Suma todas las cotizaciones del proyecto y actualiza el campo presupuesto.
   */
  @Post('proyecto/:proyectoUuid/calcular-presupuesto')
  @Patch('proyecto/:proyectoUuid/calcular-presupuesto')
  @Post('proyecto/:proyectoUuid/presupuesto')
  @Patch('proyecto/:proyectoUuid/presupuesto')
  @ApiOperation({
    summary: 'Calcular el presupuesto del proyecto sumando todas sus cotizaciones',
    description:
      'Suma el montoTotal de cada cotización del proyecto y actualiza el presupuesto del proyecto.',
  })
  async calcularPresupuesto(
    @Param('proyectoUuid', new ParseUUIDPipe()) proyectoUuid: string,
  ) {
    const res = await this.cotizacionService.calcularPresupuestoProyecto(proyectoUuid);

    if (!res.exitoso) {
      throw new NotFoundException({
        exitoso: res.exitoso,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
      _resultado: res.resultado,
    };
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
