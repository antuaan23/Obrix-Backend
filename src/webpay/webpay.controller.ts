import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { WebpayService } from './webpay.service';
import { IniciarPagoDto } from './dto/iniciar-pago.dto';
import { FiltroPagosDto } from './dto/filtro-pagos.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolEnum } from 'src/rol/rol.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('Webpay')
@Controller('webpay')
export class WebpayController {
  constructor(
    private readonly webpayService: WebpayService,
    private readonly configService: ConfigService,
  ) {}

  @Post('iniciar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Iniciar pago de un Plan con Webpay Plus',
    description: 'Genera la transacción en Transbank y guarda el registro en BD. Retorna la URL hacia la que redirigir al usuario.',
  })
  @ApiResponse({ status: 201, description: 'Transacción iniciada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al iniciar la transacción o plan inválido.' })
  async iniciar(
    @GetUser('userId') usuarioId: number,
    @Body() dto: IniciarPagoDto,
  ) {
    const res = await this.webpayService.iniciarPago(usuarioId, dto.planId);

    if (!res.exitoso) {
      throw new BadRequestException({
        exitoso: false,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
    };
  }

  @Get('retorno')
  @Post('retorno')
  @ApiOperation({
    summary: 'URL de retorno de Webpay (Confirmación automática y activación de Plan)',
    description: 'Transbank redirige a esta ruta con token_ws o TBK_TOKEN. Se ejecuta el commit y se activa la suscripción en PostgreSQL.',
  })
  async retorno(
    @Query('token_ws') tokenWs?: string,
    @Query('TBK_TOKEN') tbkToken?: string,
    @Body('token_ws') bodyTokenWs?: string,
    @Body('TBK_TOKEN') bodyTbkToken?: string,
    @Res() res?: Response,
  ) {
    const token = tokenWs || bodyTokenWs;
    const anuladoToken = tbkToken || bodyTbkToken;
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:5173';

    // 1. Caso: El usuario canceló la compra en el portal de Transbank
    if (anuladoToken && !token) {
      await this.webpayService.anularPago(anuladoToken);

      if (res) {
        return res.redirect(
          `${frontendUrl.replace(/\/$/, '')}/planes?estado=anulado`,
        );
      }
      return {
        exitoso: false,
        descripcion: 'La compra fue cancelada por el usuario en Transbank.',
      };
    }

    // 2. Caso: No llegó ningún token
    if (!token) {
      if (res) {
        return res.redirect(
          `${frontendUrl.replace(/\/$/, '')}/planes?estado=error&mensaje=token_faltante`,
        );
      }
      throw new BadRequestException({
        exitoso: false,
        descripcion: 'Token de Webpay no proporcionado.',
      });
    }

    // 3. Caso: Confirmar transacción y activar suscripción
    const confirmacion = await this.webpayService.confirmarPago(token);

    if (res) {
      if (confirmacion.exitoso) {
        const orden = confirmacion.resultado?.buyOrder || '';
        const plan = encodeURIComponent(confirmacion.resultado?.planNombre || '');
        return res.redirect(
          `${frontendUrl.replace(/\/$/, '')}/planes?estado=exitoso&orden=${orden}&plan=${plan}`,
        );
      } else {
        return res.redirect(
          `${frontendUrl.replace(/\/$/, '')}/planes?estado=rechazado&mensaje=${encodeURIComponent(
            confirmacion.descripcion,
          )}`,
        );
      }
    }

    return {
      exitoso: confirmacion.exitoso,
      descripcion: confirmacion.descripcion,
      respuesta: confirmacion.resultado,
    };
  }

  @Get('mis-pagos')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener el historial de pagos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Historial obtenido correctamente.' })
  async misPagos(@GetUser('userId') usuarioId: number) {
    const res = await this.webpayService.obtenerHistorialUsuario(usuarioId);

    if (!res.exitoso) {
      throw new NotFoundException({
        exitoso: false,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
    };
  }

  // ==========================================
  // PANEL ADMINISTRATIVO DE PAGOS
  // ==========================================
  @Get('admin/pagos')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMIN)
  @ApiOperation({
    summary: 'Panel Admin: Listar todos los pagos con filtros avanzados y métricas (Solo Admin)',
    description: 'Permite filtrar por estado, plan, rango de fechas y buscador por texto (orden, autorización, RUT, nombre, email), además de paginación.',
  })
  @ApiResponse({ status: 200, description: 'Listado de pagos y métricas recuperado exitosamente.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado: requiere rol ADMIN.' })
  async obtenerPagosAdmin(@Query() filtros: FiltroPagosDto) {
    const res = await this.webpayService.obtenerTodosLosPagos(filtros);

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
    };
  }
}
