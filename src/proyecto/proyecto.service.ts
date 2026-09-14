import { Injectable } from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Repository } from 'typeorm';
import { Result } from 'src/result';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
import { ProyectoResponseDto } from './dto/proyecto-response.dto';

@Injectable()
export class ProyectoService {

  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>
  ){}

  async create(dto: CreateProyectoDto): Promise<Result<ProyectoResponseDto>> {
    let cliente: Cliente | null = null;
    let trabajador: Trabajador | null = null;
  
    // 1. Validar y obtener el trabajador si se envía en el DTO
    if (dto.uuidTrabajador) {
      trabajador = await this.trabajadorRepository.findOne({
        where: { uuid: dto.uuidTrabajador },
      });
  
      if (!trabajador) {
        return Result.fallo<Proyecto>('El trabajador especificado no existe.');
      }
    }
  
    // 2. Validar y obtener el cliente si se envía en el DTO
    if (dto.clienteId) {
      cliente = await this.clienteRepository.findOne({
        where: { uuid: dto.clienteId },
      });
  
      if (!cliente) {
        return Result.fallo<Proyecto>('El cliente especificado no existe.');
      }
    }
  
    // 3. Crear y guardar la entidad mapeando las relaciones
    const nuevoProyecto = this.proyectoRepository.create({
      nombre: dto.nombre,
      cliente: cliente ?? undefined,
      
      trabajadores: trabajador ? [trabajador] : [],
      
      // Si la relación es @ManyToMany (múltiples trabajadores en un proyecto):
      // trabajadores: trabajador ? [trabajador] : [],
    });
  
    const guardar = await this.proyectoRepository.save(nuevoProyecto);
    const respuestaDto = ProyectoResponseDto.fromEntity(guardar);
    return Result.ok(respuestaDto, 'Proyecto creado exitosamente.');
  }

  findAll() {
    return `This action returns all proyecto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proyecto`;
  }

  async update(uuid: string, dto: UpdateProyectoDto): Promise<Result<Proyecto>> {
    const proyecto = await this.proyectoRepository.findOne({ 
      where: { uuid },
      relations: {
        cliente: true
      }
    });

    if (!proyecto) {
      return Result.fallo<Proyecto>('Proyecto no encontrado.');
    }

    if (dto.nombre) proyecto.nombre = dto.nombre;

    if (dto.clienteId !== undefined) {
      const cliente = await this.clienteRepository.findOne({ where: { uuid: dto.clienteId } });
      if (!cliente) {
        return Result.fallo<Proyecto>('El cliente a asociar no existe.');
      }
      proyecto.cliente = cliente;
    }

    const actualizado = await this.proyectoRepository.save(proyecto);
    return Result.ok(actualizado, 'Proyecto actualizado exitosamente.');
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }
}
