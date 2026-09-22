import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException, NotFoundException, HttpStatus, HttpCode } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsuarioListResponseDto, ErrorResponseDto, UsuarioDto } from './dto/usuario-response.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la lista completa de usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios recuperada exitosamente.',
    type: UsuarioListResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
    type: ErrorResponseDto,
  })

  async findAll() {
    const resultado = await this.usuarioService.findAll();

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
    const resultado = await this.usuarioService.findOne(uuid);
  
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
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
}
