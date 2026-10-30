import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuscripcionService } from './suscripcion.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';

@ApiTags('Suscripción')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suscripcion')
export class SuscripcionController {

    constructor(private readonly suscripcionService: SuscripcionService) { }

    @Get('resumen')
    @ApiOperation({ summary: 'Ver uso actual del plan y cobro estimado del mes' })
    calcularResumen(@GetUser('userId') usuarioId: number) {
        return this.suscripcionService.calcularResumen(usuarioId);
    }

    @Patch('cambiar-plan')
    @ApiOperation({ summary: 'Cambiar el plan activo del usuario autenticado' })
    cambiarPlan(@GetUser('userId') usuarioId: number, @Body() dto: CreateSuscripcionDto) {
        return this.suscripcionService.cambiarPlan(usuarioId, dto.planId);
    }
}
