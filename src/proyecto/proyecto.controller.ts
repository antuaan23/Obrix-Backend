import { Controller, Post, Body, Patch, Param, InternalServerErrorException, NotFoundException, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { ProyectoResponseDto } from './dto/proyecto-response.dto';

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

  @Get(':uuid')
  @ApiOperation({ summary: 'Obtener proyecto por UUID.' })
  @ApiResponse({
    status: 200,
    description: 'Proyecto encontrado exitosamente.',
    type: [ProyectoResponseDto],
  })
  async findOne(@Param('uuid') uuid: string) {
    const res = await this.proyectosService.findOne(uuid);

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

}
