import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cotizacion } from '../cotizacion/entities/cotizacion.entity';
import { DetalleCotizacion } from '../cotizacion/entities/detalle-cotizacion.entity';
import { Material } from '../material/entities/material.entity';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { Result } from 'src/common/interfaces/result';
import { PdfService } from 'src/pdf/pdf.service';
import { COTIZACION_PDF_TEMPLATE } from 'src/pdf/templates/cotizacion-pdf.template';
import { ProyectoService } from 'src/proyecto/proyecto.service';

@Injectable()
export class CotizacionService {
  constructor(
    @InjectRepository(Cotizacion)
    private readonly cotizacionRepo: Repository<Cotizacion>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,

    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,

    private readonly pdfService: PdfService,
    private readonly proyectoService: ProyectoService,
  ) {}

  async crearCotizacion(dto: CreateCotizacionDto): Promise<Result<Cotizacion>> {
    const proyecto = await this.proyectoRepo.findOneBy({ uuid: dto.proyectoUuid });
    if (!proyecto) {
      return Result.fallo<Cotizacion>('El proyecto especificado no existe.');
    }

    const cotizacion = new Cotizacion();
    cotizacion.nombre = dto.nombre;
    cotizacion.proyecto = proyecto;
    cotizacion.detalles = [];

    let totalCotizacion = 0;

    for (const item of dto.items) {
      const material = await this.materialRepo.findOneBy({ uuid: item.materialUuid });
      if (!material) {
        return Result.fallo<Cotizacion>(`El material con UUID ${item.materialUuid} no existe.`);
      }

      const detalle = new DetalleCotizacion();
      detalle.material = material;

      const cantidad = Number(item.cantidad);
      const precioUnitario = Number(item.precioUnitario ?? material.precio_clp);

      detalle.cantidad = cantidad;
      detalle.nombre = material.producto;
      detalle.total = cantidad * precioUnitario;

      totalCotizacion += detalle.total;
      cotizacion.detalles.push(detalle);
    }

    cotizacion.montoTotal = totalCotizacion;

    const cotizacionGuardada = await this.cotizacionRepo.save(cotizacion);

    // El presupuesto del proyecto es la suma de sus cotizaciones.
    await this.proyectoService.calcularYActualizarPresupuesto(proyecto.uuid);

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

  /**
   * Genera el PDF de una sola cotización (identificada por UUID).
   * Pensado para un botón en el front: GET /api/cotizacion/:uuid/pdf
   */
  async generarPdfPorUuid(uuid: string): Promise<{ pdfBuffer: Buffer; nombreArchivo: string }> {
    const cotizacion = await this.cotizacionRepo.findOne({
      where: { uuid },
      relations: {
        detalles: {
          material: true,
        },
        proyecto: {
          cliente: true,
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException(`Cotización con UUID ${uuid} no encontrada`);
    }

    const cliente = cotizacion.proyecto?.cliente;
    const clienteNombre = cliente
      ? [cliente.nombre, cliente.ap_paterno, cliente.ap_materno].filter(Boolean).join(' ')
      : 'Sin cliente asignado';

    const quoteData = {
      codigo: `COT-${cotizacion.id}`,
      nombreCotizacion: cotizacion.nombre,
      proyectoNombre: cotizacion.proyecto?.nombre ?? 'Sin proyecto',
      clienteNombre,
      fecha: new Date(cotizacion.creadoEl).toLocaleDateString('es-CL'),
      items: (cotizacion.detalles ?? []).map((det) => {
        const cantidad = Number(det.cantidad || 0);
        const total = Number(det.total || 0);
        const unitPrice = cantidad > 0 ? total / cantidad : 0;

        return {
          name: det.nombre || det.material?.producto || 'Material sin nombre',
          quantity: Number.isInteger(cantidad) ? cantidad : Number(cantidad.toFixed(2)),
          unitPrice,
          total,
        };
      }),
      total: Number(cotizacion.montoTotal || 0),
    };

    const pdfBuffer = await this.pdfService.generatePdf(COTIZACION_PDF_TEMPLATE, quoteData);
    const slug = this.slugNombreArchivo(cotizacion.nombre);

    return {
      pdfBuffer,
      nombreArchivo: `Cotizacion_${slug || quoteData.codigo}.pdf`,
    };
  }

  private slugNombreArchivo(nombre: string): string {
    return nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 40);
  }
}
