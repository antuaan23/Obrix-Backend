import { Inject, Injectable, Res } from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { Repository } from 'typeorm';
import { Result } from 'src/common/interfaces/result';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ProyectoResponseDto } from './dto/proyecto-response.dto';
import { PresupuestoCalculadoDto } from './dto/presupuesto-calculado.dto';
import { Gasto } from 'src/gasto/entities/gasto.entity';
import { MailService } from 'src/mail/mail.service';
import { Mail } from 'nodemailer';

@Injectable()
export class ProyectoService {

  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Gasto)
    private readonly gastoRepository: Repository<Gasto>,

    private readonly mailService: MailService
  ) {}

  async create(dto: CreateProyectoDto): Promise<Result<ProyectoResponseDto>> {
    // 1. Validar y obtener el usuario
    const usuario = await this.usuarioRepository.findOne({
      where: { uuid: dto.uuidUsuario },
    });
  
    if (!usuario) {
      return Result.fallo<ProyectoResponseDto>('El usuario especificado no existe.');
    }
  
    // 2. Crear la entidad
    const nuevoProyecto = this.proyectoRepository.create({
      nombre: dto.nombre,
      servicio: dto.servicio,
      presupuesto: 0.00,
      usuarios: [usuario],
      cliente: dto.cliente, // Cascade insert
    });
  
    // 3. Guardar el proyecto en la base de datos
    const proyectoGuardado = await this.proyectoRepository.save(nuevoProyecto);
  
    // 4. Cargar la entidad completa con todas sus relaciones para el DTO
    const proyectoCompleto = await this.proyectoRepository.findOne({
      where: { uuid: proyectoGuardado.uuid },
      relations: {
        cliente: true,
        usuarios: true,
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
        usuarios: true,
      },
      order: {
        creadoEl: 'DESC',
      },
    });

    const respuesta = proyectos.map((p) => ProyectoResponseDto.fromEntity(p));
    return Result.ok(respuesta, 'Lista de proyectos obtenida correctamente.');
  }

  async findByUsuarioUuid(uuidUsuario: string): Promise<Result<ProyectoResponseDto[]>> {
    const proyectos = await this.proyectoRepository.find({
      where: {
        usuarios: {
          uuid: uuidUsuario,
        },
      },
      relations: {
        cliente: true,
        usuarios: true,
      },
    });
  
    if (!proyectos || proyectos.length === 0) {
      return Result.fallo<ProyectoResponseDto[]>('No se encontraron proyectos para el usuario.');
    }
  
    const proyectosDto = proyectos.map((proyecto) => ProyectoResponseDto.fromEntity(proyecto));
  
    return Result.ok(proyectosDto, 'Proyectos del usuario encontrados.');
  }

  async findOneByUuid(uuidProyecto: string): Promise<Result<ProyectoResponseDto>> {
    const proyecto = await this.proyectoRepository.findOne({
      where: { 
        uuid: uuidProyecto 
      },
      relations: {
        cliente: true,
        usuarios: true,
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
        usuarios: true,
      }
    });

    if (!proyecto) {
      return Result.fallo<ProyectoResponseDto>('Proyecto no encontrado.');
    }

    if (dto.nombre) proyecto.nombre = dto.nombre;
    if (dto.servicio) proyecto.servicio = dto.servicio;


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

  async obtenerPresupuestoConGastosPorUuid(uuid: string): Promise<Result<any>> {
    // 1. Buscamos el proyecto por UUID
    const proyecto = await this.proyectoRepository.findOne({
      where: { uuid },
    });

    if (!proyecto) {
      return Result.fallo(`El proyecto con UUID ${uuid} no fue encontrado.`);
    }

    // 2. Sumamos los gastos asociados agrupando correctamente para PostgreSQL usando el uuid
    const resultado = await this.proyectoRepository
      .createQueryBuilder('proyecto')
      .leftJoin('proyecto.gastos', 'gasto')
      .select('proyecto.id', 'id')
      .addSelect('proyecto.uuid', 'uuid')
      .addSelect('proyecto.nombre', 'nombre')
      .addSelect('proyecto.presupuesto', 'presupuesto')
      .addSelect('COALESCE(SUM(gasto.monto), 0)', 'totalGastos')
      .where('proyecto.uuid = :uuid', { uuid })
      .groupBy('proyecto.id')
      .addGroupBy('proyecto.uuid')
      .addGroupBy('proyecto.nombre')
      .addGroupBy('proyecto.presupuesto')
      .getRawOne();

    const presupuesto = Number(resultado?.presupuesto) || 0;
    const totalGastos = Number(resultado?.totalGastos) || 0;
    const excedido = totalGastos > presupuesto;
    const diferencia = totalGastos - presupuesto;

    const datosPresupuesto = {
      id: proyecto.id,
      uuid: proyecto.uuid,
      nombre: proyecto.nombre,
      presupuesto,
      totalGastos,
      excedido,
      diferencia: excedido ? diferencia : 0,
    };

    return Result.ok(datosPresupuesto, 'Presupuesto y gastos calculados correctamente.');
  }

  /**
   * Define el presupuesto del proyecto como la suma de montoTotal de todas sus cotizaciones.
   * Se invoca desde el endpoint PATCH y también al crear una cotización.
   */
  async calcularYActualizarPresupuesto(
    uuidProyecto: string,
  ): Promise<Result<PresupuestoCalculadoDto>> {
    const proyecto = await this.proyectoRepository.findOne({
      where: { uuid: uuidProyecto },
      relations: {
        cotizaciones: true,
      },
    });

    if (!proyecto) {
      return Result.fallo<PresupuestoCalculadoDto>('Proyecto no encontrado.');
    }

    const cotizaciones = proyecto.cotizaciones ?? [];
    const presupuestoTotal = cotizaciones.reduce((acc, cot) => acc + Number(cot.montoTotal || 0), 0);

    proyecto.presupuesto = presupuestoTotal;
    await this.proyectoRepository.save(proyecto);

    const datos: PresupuestoCalculadoDto = {
      uuid: proyecto.uuid,
      nombre: proyecto.nombre,
      cantidadCotizaciones: cotizaciones.length,
      presupuesto: presupuestoTotal,
      cotizaciones: cotizaciones.map((cot) => ({
        uuid: cot.uuid,
        nombre: cot.nombre,
        montoTotal: Number(cot.montoTotal || 0),
      })),
    };

    return Result.ok(
      datos,
      cotizaciones.length === 0
        ? 'El proyecto no tiene cotizaciones. El presupuesto quedó en 0.'
        : 'Presupuesto del proyecto calculado a partir de las cotizaciones.',
    );
  }

  async agregarUsuarioAProyecto(uuidProyecto: string, uuidUsuario: string): Promise<Result<Proyecto>> {
    // 1. Buscar el proyecto por UUID para obtener su ID numérico
    const proyecto = await this.proyectoRepository.findOne({ where: { uuid: uuidProyecto } });
    if (!proyecto) {
      return Result.fallo<Proyecto>(`Proyecto con UUID ${uuidProyecto} no encontrado.`);
    }
  
    // 2. Buscar al usuario por UUID para obtener su ID numérico
    const usuario = await this.usuarioRepository.findOne({ where: { uuid: uuidUsuario } });
    if (!usuario) {
      return Result.fallo<Proyecto>(`Usuario con UUID ${uuidUsuario} no encontrado.`);
    }
  
    // 3. Verificar si ya existe la relación en la tabla intermedia para evitar duplicados
    const existeRelacion = await this.proyectoRepository
      .createQueryBuilder()
      .relation(Proyecto, 'usuarios')
      .of(proyecto.id)
      .loadMany();
  
    const yaEstaAsociado = existeRelacion.some((u) => u.id === usuario.id);
    if (yaEstaAsociado) {
      return Result.fallo<Proyecto>('El usuario ya está asociado al proyecto.');
    }
  
    // 4. Agregar la relación directamente a la tabla intermedia de forma segura
    await this.proyectoRepository
      .createQueryBuilder()
      .relation(Proyecto, 'usuarios')
      .of(proyecto.id)
      .add(usuario.id);
  
    // 5. Retornar el proyecto actualizado con todos sus usuarios
    const proyectoActualizado = await this.proyectoRepository.findOne({
      where: { uuid: uuidProyecto },
      relations: { usuarios: true, cliente: true },
    });
  
    return Result.ok(proyectoActualizado!, 'Usuario agregado al proyecto correctamente');
  }
}