import { Controller, Post, Body, Patch, Param, InternalServerErrorException, NotFoundException, Get, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { ProyectoResponseDto } from './dto/proyecto-response.dto';
import { PresupuestoCalculadoDto } from './dto/presupuesto-calculado.dto';

@ApiTags('Proyectos')
@Controller('proyectos')
export class ProyectoController {
  constructor(private readonly proyectosService: ProyectoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la lista completa de proyectos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de proyectos recuperada exitosamente.',
    type: [ProyectoResponseDto],
  })
  async findAll() {
    const res = await this.proyectosService.findAll();

    if (!res.exitoso) {
      throw new InternalServerErrorException({
        exitoso: res.exitoso,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
    };
  }  

  @Get('/usuario/:uuid')
  @ApiOperation({ summary: 'Obtener proyecto por UUID de Usuario.' })
  @ApiResponse({
    status: 200,
    description: 'Proyecto encontrado exitosamente.',
    type: [ProyectoResponseDto],
  })
  async findOne(@Param('uuid') uuid: string) {
    const res = await this.proyectosService.findByUsuarioUuid(uuid);

    if (!res.exitoso) {
      throw new InternalServerErrorException({
        exitoso: res.exitoso,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
    };
  }  

  @Get(':uuid')
  @ApiOperation({ summary: 'Obtener proyecto por UUID de Proyecto.' })
  @ApiResponse({
    status: 200,
    description: 'Proyecto encontrado exitosamente.',
    type: ProyectoResponseDto,
  })
  async findOneByUuid(@Param('uuid') uuid: string) {
    const res = await this.proyectosService.findOneByUuid(uuid);

    if (!res.exitoso) {
      throw new InternalServerErrorException({
        exitoso: res.exitoso,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
    };
  }


  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proyecto (solo con nombre o con datos opcionales)' })
  async crear(@Body() dto: CreateProyectoDto) {
    const res = await this.proyectosService.create(dto);
    if (!res.exitoso) {
      throw new InternalServerErrorException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Asignar cliente o actualizar datos del proyecto' })
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateProyectoDto) {
    const res = await this.proyectosService.update(uuid, dto);
    if (!res.exitoso) {
      throw new NotFoundException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  @Get(':uuid/presupuesto')
  @ApiOperation({ summary: 'Obtener el estado del presupuesto y total de gastos de un proyecto por UUID' })
  async obtenerPresupuesto(@Param('uuid') uuid: string) {
    const res = await this.proyectosService.obtenerPresupuestoConGastosPorUuid(uuid);

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
    };
  }

  /**
   * Front: botón "Generar presupuesto" → PATCH /api/proyectos/{uuid}/presupuesto-desde-cotizaciones
   * Suma todas las cotizaciones del proyecto y guarda el resultado en proyecto.presupuesto.
   */
  @Patch(':uuid/calcular-presupuesto')
  @Patch(':uuid/presupuesto-desde-cotizaciones')
  @ApiOperation({
    summary: 'Calcular el presupuesto del proyecto sumando sus cotizaciones',
    description:
      'Suma el montoTotal de cada cotización del proyecto y actualiza el campo presupuesto. También se ejecuta automáticamente al crear una cotización.',
  })
  @ApiResponse({ status: 200, type: PresupuestoCalculadoDto })
  @ApiResponse({ status: 404, description: 'El proyecto no existe.' })
  async calcularPresupuesto(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    const res = await this.proyectosService.calcularYActualizarPresupuesto(uuid);

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
    };
  }
}
