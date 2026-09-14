import { Injectable } from '@nestjs/common';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Trabajador } from './entities/trabajador.entity';
import { Result } from 'src/result';

@Injectable()
export class TrabajadorService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
  ) {}

  async findAll(): Promise<Result<Trabajador[]>> {

    const trabajadores = await this.trabajadorRepository.find({
      select: {
        uuid:true, 
        email:true, 
        activo:true
      },
    });

    return Result.ok(trabajadores, 'lista de trabajadores obtenida correctamente');
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  update(id: number, updateUsuarioDto: UpdateTrabajadorDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
