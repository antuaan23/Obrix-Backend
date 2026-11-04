import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Materiales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
