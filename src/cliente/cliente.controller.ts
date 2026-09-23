import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClienteResponseDto } from './dto/proyecto-response.dto';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get(':uuid')
  @ApiOperation({ summary: 'Obtener cliente por UUID.' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado exitosamente.',
    type: [ClienteResponseDto],
  })
  async findOne(@Param('uuid') uuid: string) {
    const res = await this.clienteService.findOne(uuid);

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(+id, updateClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteService.remove(+id);
  }
}
