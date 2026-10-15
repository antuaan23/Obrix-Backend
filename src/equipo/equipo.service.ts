import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Equipo } from './entities/equipo.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { Result } from 'src/common/interfaces/result';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';

@Injectable()
export class EquipoService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepository: Repository<Equipo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>
  ) {}

  async create(createEquipoDto: CreateEquipoDto): Promise<Result<Equipo>> {
    const { nombre, uuidUsuarioLider, uuidTrabajadores, uuidProyecto } = createEquipoDto;

    const proyecto = await this.proyectoRepository.findOne({ where: { uuid: uuidProyecto}})
    if(!uuidProyecto){
      return Result.fallo<Equipo>(`El proyecto con UUID ${uuidProyecto} no fue encontrado.`)
    }

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

    const nuevoEquipo = this.equipoRepository.create({ nombre });
    const equipoGuardado = await this.equipoRepository.save(nuevoEquipo);

    proyecto!.equipo = equipoGuardado;
    await this.proyectoRepository.save(proyecto!);

    // 4. Asignar el equipo al líd
    if(!lider.equipos){
      lider.equipos = [];
    }
    lider.equipos.push(equipoGuardado);
    await this.usuarioRepository.save(lider);

    // 5. Asignar el equipo a cada trabajador y guardarlos
    for (const trabajador of trabajadores){
      if(!trabajador.equipos){
        trabajador.equipos = [];
      }
      trabajador.equipos.push(equipoGuardado);
      await this.usuarioRepository.save(trabajador)
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

  async agregarUsuario(uuidEquipo: string, uuidUsuario: string): Promise<Result<Equipo>> {
    // 1. Buscar el equipo
    const equipoResult = await this.findOne(uuidEquipo);
    if (!equipoResult.exitoso || !equipoResult.resultado) {
      return Result.fallo<Equipo>(`Equipo con UUID ${uuidEquipo} no encontrado.`);
    }
    const equipo = equipoResult.resultado;

    // 2. Buscar al usuario
    const usuario = await this.usuarioRepository.findOne({ where: { uuid: uuidUsuario } });
    if (!usuario) {
      return Result.fallo<Equipo>(`Usuario con UUID ${uuidUsuario} no encontrado.`);
    }

    // 3. Verificar si el usuario ya pertenece al equipo para evitar duplicados
    if (!equipo.usuarios) {
      equipo.usuarios = [];
    }
    
    const yaExiste = equipo.usuarios.some((u) => u.uuid === uuidUsuario);
    if (yaExiste) {
      return Result.fallo<Equipo>('El usuario ya forma parte de este equipo.');
    }

    // 4. Agregar el usuario al equipo y guardar
    equipo.usuarios.push(usuario);
    await this.equipoRepository.save(equipo);

    // Retornar el equipo actualizado
    return this.findOne(uuidEquipo);
  }
}