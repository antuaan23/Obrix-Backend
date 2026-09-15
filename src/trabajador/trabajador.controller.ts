import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException, NotFoundException, HttpStatus, HttpCode } from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TrabajadorListResponseDto, ErrorResponseDto, TrabajadorDto } from './dto/trabajador-response.dto';

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

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('uuid') uuid: string) {
    const resultado = await this.trabajadorService.findOne(uuid);
  
    // 1. Si la búsqueda no fue exitosa, lanzamos un error 404 (o 400)
    if (!resultado.exitoso) {
      throw new NotFoundException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }
  
    // 2. Si fue exitosa, retornamos la respuesta limpia con código 200 OK
    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado._resultado,
    };
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
