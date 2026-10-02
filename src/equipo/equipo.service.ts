import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Equipo } from './entities/equipo.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { Result } from 'src/common/interfaces/result';

@Injectable()
export class EquipoService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createEquipoDto: CreateEquipoDto): Promise<Result<Equipo>> {
    const { nombre, uuidUsuarioLider, uuidTrabajadores } = createEquipoDto;

    // 1. Verificar y buscar al líder por su UUID
    const lider = await this.usuarioRepository.findOne({ where: { uuid: uuidUsuarioLider } });
    if (!lider) {
      return Result.fallo<Equipo>(`El usuario líder con UUID ${uuidUsuarioLider} no fue encontrado.`);
    }

    // 2. Verificar y buscar a los trabajadores por sus UUIDs
    const trabajadores = await this.usuarioRepository.find({
      where: { uuid: In(uuidTrabajadores) },
    });

    if (trabajadores.length !== uuidTrabajadores.length) {
      return Result.fallo<Equipo>('Algunos UUIDs de los trabajadores proporcionados no son válidos o no existen.');
    }

    // 3. Crear y guardar el equipo
    const nuevoEquipo = this.equipoRepository.create({ nombre });
    const equipoGuardado = await this.equipoRepository.save(nuevoEquipo);

    // 4. Asignar el equipo al líder y guardarlo
    lider.equipo = equipoGuardado;
    await this.usuarioRepository.save(lider);

    // 5. Asignar el equipo a cada trabajador y guardarlos
    for (const trabajador of trabajadores) {
      trabajador.equipo = equipoGuardado;
      await this.usuarioRepository.save(trabajador);
    }

    // Retornar el equipo completo con sus relaciones envuelto en Result.ok
    const equipoCompleto = await this.findOne(equipoGuardado.uuid);
    if (!equipoCompleto.exitoso) {
      return Result.fallo<Equipo>('Error al recuperar el equipo recién creado.');
    }

    return Result.ok(equipoCompleto.resultado, 'Equipo creado y asignado correctamente');
  }

  async findAll(): Promise<Result<Equipo[]>> {
    const equipos = await this.equipoRepository.find({
      relations: {
        usuarios: true, 
        proyectos:true
      },
    });

    return Result.ok(equipos, 'Lista de equipos obtenida correctamente');
  }

  async findOne(uuid: string): Promise<Result<Equipo>> {
    const equipo = await this.equipoRepository.findOne({
      where: { uuid },
      relations: {
        usuarios: true, 
        proyectos:true
      },
    });

    if (!equipo) {
      return Result.fallo<Equipo>(`Equipo con UUID ${uuid} no encontrado.`);
    }

    return Result.ok(equipo, `Equipo ${uuid} encontrado correctamente`);
  }
}