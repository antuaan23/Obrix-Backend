import { Controller, Get, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { Material } from './entities/material.entity';

@ApiTags('Materiales')
@Controller('materiales')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener catálogo completo de materiales' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de materiales obtenida correctamente.' 
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron materiales registrados.',
  })
  async findAll() {
    const res = await this.materialService.findAll();

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