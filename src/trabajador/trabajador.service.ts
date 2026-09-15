import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Trabajador } from './entities/trabajador.entity';
import { Result } from 'src/result';
import { NotFoundError } from 'rxjs';
import { TrabajadorDto } from './dto/trabajador-response.dto';

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

  async findOne(uuid: string): Promise<Result<TrabajadorDto>> {
    const trabajador = await this.trabajadorRepository.findOneBy({ uuid });
  
    if (!trabajador) {
      return Result.fallo<TrabajadorDto>('Trabajador no encontrado'); 
    }
    const trabajadorDto: TrabajadorDto = {
      uuid: trabajador.uuid,
      rut: trabajador.rut,
      nombre: trabajador.nombre,
      ap_paterno: trabajador.ap_paterno,
      ap_materno: trabajador.ap_materno,
      email: trabajador.email,
      telefono: trabajador.telefono,
      activo: trabajador.activo,
      creado_el: trabajador.creado_el,
      actualizado_el: trabajador.actualizado_el,
    };
  
    return Result.ok<TrabajadorDto>(trabajadorDto, `Trabajador ${trabajador.uuid} encontrado correctamente`);
  }

  update(id: number, updateUsuarioDto: UpdateTrabajadorDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
