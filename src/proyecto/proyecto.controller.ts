import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Get,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { ProyectoResponseDto } from './dto/proyecto-response.dto';
import { PresupuestoCalculadoDto } from './dto/presupuesto-calculado.dto';
import { AgregarUsuarioProyectoDto } from './dto/agregar-usuario-proyecto.dto';

@ApiTags('Proyectos')
@Controller('proyectos')
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la lista completa de proyectos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de proyectos recuperada exitosamente.',
    type: [ProyectoResponseDto],
  })
  async findAll() {
    const res = await this.proyectoService.findAll();

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
  @ApiOperation({ summary: 'Obtener proyectos asociados a un UUID de Usuario' })
  @ApiResponse({
    status: 200,
    description: 'Proyectos encontrados exitosamente.',
    type: [ProyectoResponseDto],
  })
  async findOne(@Param('uuid') uuid: string) {
    const res = await this.proyectoService.findByUsuarioUuid(uuid);

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

  @Get(':uuid')
  @ApiOperation({ summary: 'Obtener proyecto por UUID de Proyecto' })
  @ApiResponse({
    status: 200,
    description: 'Proyecto encontrado exitosamente.',
    type: ProyectoResponseDto,
  })
  async findOneByUuid(@Param('uuid') uuid: string) {
    const res = await this.proyectoService.findOneByUuid(uuid);

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

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  async crear(@Body() dto: CreateProyectoDto) {
    const res = await this.proyectoService.create(dto);
    if (!res.exitoso) {
      throw new BadRequestException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Asignar cliente o actualizar datos del proyecto' })
  async update(@Param('uuid') uuid: string, @Body() dto: UpdateProyectoDto) {
    const res = await this.proyectoService.update(uuid, dto);
    if (!res.exitoso) {
      throw new NotFoundException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  /**
   * Borrado lógico: Desactiva el proyecto
   */
  @Delete(':uuid')
  @ApiOperation({ summary: 'Borrado lógico: Desactivar un proyecto por UUID' })
  @ApiResponse({ status: 200, description: 'Proyecto desactivado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  async remove(@Param('uuid') uuid: string) {
    const res = await this.proyectoService.remove(uuid);
    if (!res.exitoso) {
      throw new NotFoundException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  /**
   * Cambiar estado activo/inactivo (Borrado / Reactivación lógica)
   */
  @Patch(':uuid/estado')
  @ApiOperation({ summary: 'Activar o desactivar un proyecto (Borrado/Reactivación lógica)' })
  @ApiResponse({ status: 200, description: 'Estado del proyecto actualizado.', type: ProyectoResponseDto })
  async cambiarEstado(
    @Param('uuid') uuid: string,
    @Body() body: { activo: boolean },
  ) {
    const res = await this.proyectoService.cambiarEstado(uuid, body.activo);
    if (!res.exitoso) {
      throw new NotFoundException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  @Patch(':uuid/activar')
  @ApiOperation({ summary: 'Activar un proyecto' })
  async activar(@Param('uuid') uuid: string) {
    const res = await this.proyectoService.cambiarEstado(uuid, true);
    if (!res.exitoso) {
      throw new NotFoundException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  @Patch(':uuid/desactivar')
  @ApiOperation({ summary: 'Desactivar un proyecto' })
  async desactivar(@Param('uuid') uuid: string) {
    const res = await this.proyectoService.cambiarEstado(uuid, false);
    if (!res.exitoso) {
      throw new NotFoundException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  @Get(':uuid/presupuesto')
  @ApiOperation({ summary: 'Obtener el estado del presupuesto y total de gastos de un proyecto por UUID' })
  async obtenerPresupuesto(@Param('uuid') uuid: string) {
    const res = await this.proyectoService.obtenerPresupuestoConGastosPorUuid(uuid);

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
    const res = await this.proyectoService.calcularYActualizarPresupuesto(uuid);

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

  @Post(':uuid/usuarios')
  @ApiOperation({ summary: 'Asociar un usuario a un proyecto' })
  async agregarUsuario(
    @Param('uuid') uuidProyecto: string,
    @Body() dto: AgregarUsuarioProyectoDto,
  ) {
    const res = await this.proyectoService.agregarUsuarioAProyecto(uuidProyecto, dto.uuidUsuario);
    if (!res.exitoso) {
      throw new BadRequestException({ exitoso: false, descripcion: res.descripcion });
    }
    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }
}
