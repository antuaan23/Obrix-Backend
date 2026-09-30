import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { Material } from './entities/material.entity';
import { Result } from 'src/common/interfaces/result';

@ApiTags('materiales')
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
  async findAll(): Promise<Result<Material[]>> {
    return await this.materialService.findAll();
  }
}