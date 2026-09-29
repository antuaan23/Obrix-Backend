import { Controller, Get } from '@nestjs/common';
import { MaterialService } from './material.service';
import { Material } from './entities/material.entity';

@Controller('materiales')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  async findAll(): Promise<{ success: boolean; data: Material[] }> {
    const materiales = await this.materialService.findAll();
    return {
      success: true,
      data: materiales,
    };
  }
}