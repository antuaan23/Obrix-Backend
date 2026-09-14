import { Controller, Post, Body, Patch, Param, InternalServerErrorException, NotFoundException, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@ApiTags('Proyectos')
@Controller('proyectos')
export class ProyectoController {
  constructor(private readonly proyectosService: ProyectoService) {}

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
