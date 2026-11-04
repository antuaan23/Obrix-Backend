import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClienteService } from './cliente.service';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get(':uuid')
  @ApiOperation({ summary: 'Obtener cliente por UUID.' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado exitosamente.',
    type: ClienteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async findOne(@Param('uuid') uuid: string) {
    const res = await this.clienteService.findOne(uuid);

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

  @Patch(':uuid')
  @ApiOperation({ summary: 'Actualizar datos de un cliente por UUID.' })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente.',
    type: ClienteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async update(
    @Param('uuid') uuid: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    const res = await this.clienteService.update(uuid, updateClienteDto);

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
}
