import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException, NotFoundException, BadRequestException, HttpStatus, HttpCode, UseGuards, Req } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsuarioListResponseDto, ErrorResponseDto, UsuarioDto } from './dto/usuario-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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

  // ==========================================
  // CREAR TRABAJADOR POR LÍDER
  // ==========================================
  @Post('trabajador')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar un trabajador vinculado al líder autenticado' })
  @ApiResponse({ status: 201, description: 'Trabajador registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o correo/RUT ya existen.' })
  async crearTrabajador(@Req() req: any, @Body() registerDto: RegisterDto) {
    const liderId = req.user.sub;

    const resultado = await this.usuarioService.crearTrabajador(liderId, registerDto);

    if (!resultado.exitoso) {
      throw new BadRequestException({
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

  // ==========================================
  // LISTAR TRABAJADORES DEL LÍDER AUTENTICADO
  // ==========================================
  @Get('mis-trabajadores')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener la lista de trabajadores asociados al líder autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores obtenida exitosamente.' })
  async obtenerMisTrabajadores(@Req() req: any) {
    const liderId = req.user.sub;

    const resultado = await this.usuarioService.obtenerTrabajadoresPorLider(liderId);

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
  
    if (!resultado.exitoso) {
      throw new NotFoundException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }
  
    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado._resultado,
    };
  }

}