import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsuarioListResponseDto, ErrorResponseDto, UsuarioDto } from './dto/usuario-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolEnum } from 'src/rol/rol.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN)
  @ApiOperation({ summary: 'Obtener la lista completa de usuarios (Solo Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios recuperada exitosamente.',
    type: UsuarioListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado: requiere rol ADMIN.',
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
      respuesta: resultado.resultado,
    };
  }

  // ==========================================
  // CREAR TRABAJADOR POR LÍDER O ADMIN
  // ==========================================
  @Post('trabajador')
  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN, RolEnum.LIDER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un trabajador vinculado al líder autenticado' })
  @ApiResponse({ status: 201, description: 'Trabajador registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o correo/RUT ya existen.' })
  async crearTrabajador(
    @GetUser('userId') liderId: number,
    @Body() registerDto: CreateTrabajadorDto,
  ) {
    const resultado = await this.usuarioService.crearTrabajador(liderId, registerDto);

    if (!resultado.exitoso) {
      throw new BadRequestException({
        exitoso: resultado.exitoso,
        descripcion: resultado.descripcion,
      });
    }

    const { password: _, id: __, liderId: ___, rol, codigoRecuperacion: ____, codigoExpiracion: _____, ...rest } = resultado.resultado as any;
    const trabajadorDto: UsuarioDto = {
      uuid: rest.uuid,
      rut: rest.rut,
      nombre: rest.nombre,
      ap_paterno: rest.ap_paterno,
      ap_materno: rest.ap_materno,
      email: rest.email,
      telefono: rest.telefono,
      activo: rest.activo,
      creado_el: rest.creado_el,
      actualizado_el: rest.actualizado_el,
    };

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: trabajadorDto,
    };
  }

  // ==========================================
  // LISTAR TRABAJADORES DEL LÍDER AUTENTICADO
  // ==========================================
  @Get('mis-trabajadores')
  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN, RolEnum.LIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener la lista de trabajadores asociados al líder autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores obtenida exitosamente.' })
  async obtenerMisTrabajadores(@GetUser('userId') liderId: number) {
    const resultado = await this.usuarioService.obtenerTrabajadoresPorLider(liderId);

    if (!resultado.exitoso) {
      throw new InternalServerErrorException({
        exitoso: resultado.exitoso,
        descripcion: resultado.descripcion,
      });
    }

    const trabajadoresDto = (resultado.resultado as any[]).map((u) => ({
      uuid: u.uuid,
      rut: u.rut,
      nombre: u.nombre,
      ap_paterno: u.ap_paterno,
      ap_materno: u.ap_materno,
      email: u.email,
      telefono: u.telefono,
      activo: u.activo,
    } as UsuarioDto));

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: trabajadoresDto,
    };
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un usuario por UUID' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente.', type: UsuarioDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
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
      respuesta: resultado.resultado,
    };
  }

  /**
   * Modificar únicamente número de teléfono y/o correo electrónico del usuario
   */
  @Patch(':uuid')
  @ApiOperation({ summary: 'Actualizar teléfono y/o correo electrónico de un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente.', type: UsuarioDto })
  @ApiResponse({ status: 400, description: 'Correo ya registrado o datos inválidos.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async update(
    @Param('uuid') uuid: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const resultado = await this.usuarioService.update(uuid, updateUsuarioDto);

    if (!resultado.exitoso) {
      if (resultado.descripcion.toLowerCase().includes('no encontrado')) {
        throw new NotFoundException({
          exitoso: false,
          descripcion: resultado.descripcion,
        });
      }
      throw new BadRequestException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado.resultado,
    };
  }

  /**
   * Borrado lógico: Desactivar usuario
   */
  @Delete(':uuid')
  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN, RolEnum.LIDER)
  @ApiOperation({ summary: 'Borrado lógico: Desactivar un usuario por UUID' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async remove(@Param('uuid') uuid: string) {
    const resultado = await this.usuarioService.remove(uuid);

    if (!resultado.exitoso) {
      throw new NotFoundException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado.resultado,
      _resultado: resultado.resultado,
    };
  }

  /**
   * Cambiar estado activo/inactivo (Borrado / Reactivación lógica)
   */
  @Patch(':uuid/estado')
  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN)
  @ApiOperation({ summary: 'Activar o desactivar un usuario (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Estado del usuario actualizado.', type: UsuarioDto })
  async cambiarEstado(
    @Param('uuid') uuid: string,
    @Body() body: { activo: boolean },
  ) {
    const resultado = await this.usuarioService.cambiarEstado(uuid, body.activo);

    if (!resultado.exitoso) {
      throw new NotFoundException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado.resultado,
    };
  }

  @Patch(':uuid/activar')
  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN)
  @ApiOperation({ summary: 'Activar un usuario (Solo Admin)' })
  async activar(@Param('uuid') uuid: string) {
    const resultado = await this.usuarioService.cambiarEstado(uuid, true);

    if (!resultado.exitoso) {
      throw new NotFoundException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado.resultado,
    };
  }

  @Patch(':uuid/desactivar')
  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN)
  @ApiOperation({ summary: 'Desactivar un usuario (Solo Admin)' })
  async desactivar(@Param('uuid') uuid: string) {
    const resultado = await this.usuarioService.cambiarEstado(uuid, false);

    if (!resultado.exitoso) {
      throw new NotFoundException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado.resultado,
    };
  }
}
