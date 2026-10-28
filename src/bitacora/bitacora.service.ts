import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bitacora } from './entities/bitacora.entity';
import { RegistroBitacora } from './entities/registro-bitacora.entity';
import { CreateRegistroBitacoraDto } from './dto/create-registro-bitacora.dto';
import { Result } from 'src/common/interfaces/result';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { obtenerColorPorIndice } from 'src/common/constants/colores.constants';


@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(Bitacora)
    private readonly bitacoraRepository: Repository<Bitacora>,

    @InjectRepository(RegistroBitacora)
    private readonly registroRepository: Repository<RegistroBitacora>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Crea una bitácora automáticamente para un proyecto recién creado.
   * Llamado internamente desde ProyectoService.
   */
  async crearParaProyecto(proyecto: Proyecto): Promise<Bitacora> {
    const bitacora = this.bitacoraRepository.create({
      nombre: proyecto.nombre,
      fechaInicio: proyecto.fechaInicio,
      fechaEstimadaTermino: proyecto.fechaEstimadaTermino,
      proyecto,
    });
    return this.bitacoraRepository.save(bitacora);
  }

  /**
   * Obtiene la bitácora de un proyecto con todos sus registros
   * agrupados por trabajador, con color asignado según orden de incorporación.
   */
  async findByProyectoUuid(uuidProyecto: string): Promise<Result<any>> {
    const proyecto = await this.proyectoRepository.findOne({
      where: { uuid: uuidProyecto },
      relations: { usuarios: { rol: true } },
    });

    if (!proyecto) {
      return Result.fallo('Proyecto no encontrado.');
    }

    const bitacora = await this.bitacoraRepository.findOne({
      where: { proyecto: { uuid: uuidProyecto } },
      relations: {
        registros: { usuario: true },
      },
      order: {
        registros: { fechaRegistro: 'ASC', creadoEl: 'ASC' },
      },
    });

    if (!bitacora) {
      return Result.fallo('Bitácora no encontrada para este proyecto.');
    }

    // Filtrar solo trabajadores (excluir líderes si se desea, aquí incluimos todos)
    const trabajadores = proyecto.usuarios ?? [];

    // Asignar color por índice de incorporación al proyecto
    const trabajadoresConDatos = trabajadores.map((usuario, index) => {
      const registrosDeUsuario = bitacora.registros.filter(
        (r) => r.usuario?.id === usuario.id,
      );
      return {
        uuid: usuario.uuid,
        nombre: `${usuario.nombre} ${usuario.ap_paterno}`,
        rol: usuario.rol?.nombre ?? 'Sin rol',
        color: obtenerColorPorIndice(index),
        registros: registrosDeUsuario.map((r) => ({
          uuid: r.uuid,
          descripcion: r.descripcion,
          fechaRegistro: r.fechaRegistro,
          creadoEl: r.creadoEl,
        })),
      };
    });

    return Result.ok(
      {
        uuid: bitacora.uuid,
        nombre: bitacora.nombre,
        fechaInicio: bitacora.fechaInicio,
        fechaEstimadaTermino: bitacora.fechaEstimadaTermino,
        trabajadores: trabajadoresConDatos,
      },
      'Bitácora obtenida correctamente.',
    );
  }

  /**
   * Registra un avance en la bitácora. Solo usuarios asociados al proyecto pueden hacerlo.
   */
  async agregarRegistro(
    dto: CreateRegistroBitacoraDto,
    uuidUsuario: string,
  ): Promise<Result<any>> {
    const bitacora = await this.bitacoraRepository.findOne({
      where: { uuid: dto.uuidBitacora },
      relations: { proyecto: { usuarios: true } },
    });

    if (!bitacora) {
      return Result.fallo('Bitácora no encontrada.');
    }

    // Verificar que el usuario pertenece al proyecto
    const usuarioEnProyecto = bitacora.proyecto.usuarios?.some(
      (u) => u.uuid === uuidUsuario,
    );

    if (!usuarioEnProyecto) {
      return Result.fallo('No tienes acceso a esta bitácora.');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { uuid: uuidUsuario },
    });

    if (!usuario) {
      return Result.fallo('Usuario no encontrado.');
    }

    const registro = this.registroRepository.create({
      descripcion: dto.descripcion,
      fechaRegistro: new Date(dto.fechaRegistro),
      bitacora,
      usuario,
    });

    const guardado = await this.registroRepository.save(registro);

    return Result.ok(
      {
        uuid: guardado.uuid,
        descripcion: guardado.descripcion,
        fechaRegistro: guardado.fechaRegistro,
        creadoEl: guardado.creadoEl,
        usuario: {
          uuid: usuario.uuid,
          nombre: `${usuario.nombre} ${usuario.ap_paterno}`,
        },
      },
      'Registro agregado a la bitácora correctamente.',
    );
  }
}
