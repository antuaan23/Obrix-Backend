import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException } from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TrabajadorListResponseDto, ErrorResponseDto } from './dto/trabajador-response.dto';

@Controller('trabajador')
export class TrabajadorController {
  constructor(private readonly trabajadorService: TrabajadorService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la lista completa de trabajadores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de trabajadores recuperada exitosamente.',
    type: TrabajadorListResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
    type: ErrorResponseDto,
  })
  async findAll() {
    const resultado = await this.trabajadorService.findAll();

    if (!resultado.exitoso) {
      throw new InternalServerErrorException({
        exitoso: resultado.exitoso,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado._resultado,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trabajadorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrabajadorDto: UpdateTrabajadorDto) {
    return this.trabajadorService.update(+id, updateTrabajadorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trabajadorService.remove(+id);
  }
}
