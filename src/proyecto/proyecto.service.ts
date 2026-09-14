import { Injectable } from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { Repository } from 'typeorm';
import { Result } from 'src/result';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
import { ProyectoResponseDto } from './dto/proyecto-response.dto';

@Injectable()
export class ProyectoService {

  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,

    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>
  ) {}

  async create(dto: CreateProyectoDto): Promise<Result<ProyectoResponseDto>> {
    // 1. Validar y obtener el trabajador
    const trabajador = await this.trabajadorRepository.findOne({
      where: { uuid: dto.uuidTrabajador },
    });
  
    if (!trabajador) {
      return Result.fallo<ProyectoResponseDto>('El trabajador especificado no existe.');
    }
  
    // 2. Crear la entidad
    const nuevoProyecto = this.proyectoRepository.create({
      nombre: dto.nombre,
      servicio: dto.servicio,
      presupuesto: dto.presupuesto,
      trabajadores: [trabajador],
      cliente: dto.cliente, // Cascade insert
    });
  
    // 3. Guardar el proyecto en la base de datos
    const proyectoGuardado = await this.proyectoRepository.save(nuevoProyecto);
  
    // 4. Cargar la entidad completa con todas sus relaciones para el DTO
    const proyectoCompleto = await this.proyectoRepository.findOne({
      where: { uuid: proyectoGuardado.uuid },
      relations: {
        cliente: true,
        trabajadores: true,
      },
    });
  
    if (!proyectoCompleto) {
      return Result.fallo<ProyectoResponseDto>('Error al recuperar el proyecto creado.');
    }
  
    const respuestaDto = ProyectoResponseDto.fromEntity(proyectoCompleto);
    
    return Result.ok(respuestaDto, 'Proyecto creado exitosamente.');
  }

  async findAll(): Promise<Result<ProyectoResponseDto[]>> {
    const proyectos = await this.proyectoRepository.find({
      relations: {
        cliente: true,
        trabajadores: true,
      },
      order: {
        creadoEl: 'DESC',
      },
    });

    const respuesta = proyectos.map((p) => ProyectoResponseDto.fromEntity(p));
    return Result.ok(respuesta, 'Lista de proyectos obtenida correctamente.');
  }

  async findOne(uuid: string): Promise<Result<ProyectoResponseDto>> {
    const proyecto = await this.proyectoRepository.findOne({
      where: { uuid },
      relations: {
        cliente: true,
        trabajadores: true,
      },
    });

    if (!proyecto) {
      return Result.fallo<ProyectoResponseDto>('Proyecto no encontrado.');
    }

    return Result.ok(ProyectoResponseDto.fromEntity(proyecto), 'Proyecto encontrado.');
  }

  async update(uuid: string, dto: UpdateProyectoDto): Promise<Result<ProyectoResponseDto>> {
    const proyecto = await this.proyectoRepository.findOne({ 
      where: { uuid },
      relations: {
        cliente: true,
        trabajadores: true,
      }
    });

    if (!proyecto) {
      return Result.fallo<ProyectoResponseDto>('Proyecto no encontrado.');
    }

    if (dto.nombre) proyecto.nombre = dto.nombre;
    if (dto.servicio) proyecto.servicio = dto.servicio;
    if (dto.presupuesto !== undefined) proyecto.presupuesto = dto.presupuesto;

    const actualizado = await this.proyectoRepository.save(proyecto);
    return Result.ok(ProyectoResponseDto.fromEntity(actualizado), 'Proyecto actualizado exitosamente.');
  }

  async remove(uuid: string): Promise<Result<boolean>> {
    const proyecto = await this.proyectoRepository.findOne({ where: { uuid } });

    if (!proyecto) {
      return Result.fallo<boolean>('Proyecto no encontrado.');
    }

    await this.proyectoRepository.remove(proyecto);
    return Result.ok(true, 'Proyecto eliminado exitosamente.');
  }
}