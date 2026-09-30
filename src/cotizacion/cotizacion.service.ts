import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cotizacion } from '../cotizacion/entities/cotizacion.entity';
import { DetalleCotizacion } from '../cotizacion/entities/detalle-cotizacion.entity';
import { Material } from '../material/entities/material.entity';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Result } from 'src/common/interfaces/result';

@Injectable()
export class CotizacionService {
  constructor(
    @InjectRepository(Cotizacion)
    private readonly cotizacionRepo: Repository<Cotizacion>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,

    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  async crearCotizacion(dto: CreateCotizacionDto): Promise<Result<Cotizacion>> {
    // 1. Validar y obtener el proyecto
    const proyecto = await this.proyectoRepo.findOneBy({ uuid: dto.proyectoUuid });
    if (!proyecto) {
      return Result.fallo<Cotizacion>('El proyecto especificado no existe.');
    }

    // 2. Instanciar cotización
    const cotizacion = new Cotizacion();
    cotizacion.nombre = dto.nombre;
    cotizacion.proyecto = proyecto;
    cotizacion.detalles = [];

    let totalCotizacion = 0;

    // 3. Procesar items/materiales
    for (const item of dto.items) {
      const material = await this.materialRepo.findOneBy({ uuid: item.materialUuid });
      if (!material) {
        return Result.fallo<Cotizacion>(`El material con UUID ${item.materialUuid} no existe.`);
      }

      const detalle = new DetalleCotizacion();
      detalle.material = material;

      const cantidad = Number(item.cantidad);
      const precioUnitario = Number(item.precioUnitario ?? material.precio);

      detalle.cantidad = cantidad;
      detalle.total = cantidad * precioUnitario;

      totalCotizacion += detalle.total;
      cotizacion.detalles.push(detalle);
    }

    cotizacion.montoTotal = totalCotizacion;

    // 4. Guardar entidad
    const cotizacionGuardada = await this.cotizacionRepo.save(cotizacion);

    // 5. Cargar relación completa para la respuesta
    const cotizacionCompleta = await this.cotizacionRepo.findOne({
      where: { uuid: cotizacionGuardada.uuid },
      relations: {
        detalles: {
          material: true,
        },
        proyecto: true,
      },
    });

    if (!cotizacionCompleta) {
      return Result.fallo<Cotizacion>('Error al recuperar la cotización creada.');
    }

    return Result.ok(cotizacionCompleta, 'Cotización creada exitosamente.');
  }

  async obtenerPorProyectoUuid(proyectoUuid: string): Promise<Result<Cotizacion[]>> {
    const proyecto = await this.proyectoRepo.findOneBy({ uuid: proyectoUuid });
    if (!proyecto) {
      return Result.fallo<Cotizacion[]>('El proyecto especificado no existe.');
    }

    const cotizaciones = await this.cotizacionRepo.find({
      where: { proyecto: { id: proyecto.id } },
      relations: {
        detalles: {
          material: true,
        },
        proyecto: true,
      },
      order: { creadoEl: 'DESC' },
    });

    if (!cotizaciones || cotizaciones.length === 0) {
      return Result.fallo<Cotizacion[]>('No se encontraron cotizaciones para el proyecto.');
    }

    return Result.ok(cotizaciones, 'Cotizaciones del proyecto encontradas.');
  }
}