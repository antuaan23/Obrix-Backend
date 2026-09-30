import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { Result } from 'src/common/interfaces/result';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async findAll(): Promise<Result<Material[]>> {
    const materiales = await this.materialRepository.find({
      order: { id: 'ASC' },
    });

    if (!materiales || materiales.length === 0) {
      return Result.fallo<Material[]>('No se encontraron materiales registrados.');
    }

    return Result.ok(materiales, 'Lista de materiales obtenida correctamente.');
  }
}