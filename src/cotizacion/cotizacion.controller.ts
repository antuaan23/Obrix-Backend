import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseUUIDPipe, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Crear una nueva cotización para un proyecto' })
  @ApiResponse({
    status: 201,
    description: 'Cotización creada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o recurso no encontrado (Proyecto/Material).',
  })
  async create(
    @Body() createCotizacionDto: CreateCotizacionDto,
  ): Promise<Result<Cotizacion>> {
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
    description: 'El proyecto no existe o no se encontraron cotizaciones.' 
  })
  async obtenerPorProyecto(
    @Param('proyectoUuid', new ParseUUIDPipe()) proyectoUuid: string,
  ): Promise<Result<Cotizacion[]>> {
    return await this.cotizacionService.obtenerPorProyectoUuid(proyectoUuid);
  }
}