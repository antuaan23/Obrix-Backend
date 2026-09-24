import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Gasto } from './entities/gasto.entity';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { Result } from '../common/interfaces/result';
import { StorageService, ArchivoSubido } from '../common/services/storage.service';

@Injectable()
export class GastoService {
  constructor(
    @InjectRepository(Gasto)
    private readonly gastoRepository: Repository<Gasto>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly storageService: StorageService, 
  ) {}

  async create(
    dto: CreateGastoDto,
    usuarioUuid: string,
    file?: ArchivoSubido,
  ): Promise<Result<Gasto>> {
    // 1. Validar existencia del proyecto
    const proyecto = await this.proyectoRepository.findOne({
      where: { uuid: dto.proyectoId },
    });

    if (!proyecto) {
      return Result.fallo<Gasto>('El proyecto especificado no existe.');
    }

    // 2. Validar existencia del usuario autenticado
    const usuario = await this.usuarioRepository.findOne({
      where: { uuid: usuarioUuid },
    });

    if (!usuario) {
      return Result.fallo<Gasto>('El usuario autenticado no fue encontrado.');
    }

    // 3. Subir boleta/comprobante a Tigris Data si existe archivo
    let imagenUrl: string | undefined;

    if (file) {
      try {
        imagenUrl = await this.storageService.subirBoleta(file, 'boletas');
      } catch (error) {
        return Result.fallo<Gasto>('No se pudo guardar el archivo del comprobante.');
      }
    }

    // 4. Guardar registro del Gasto en PostgreSQL
    const nuevoGasto = this.gastoRepository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      monto: dto.monto,
      imagenUrl: imagenUrl,
      proyecto: proyecto,
      usuario: usuario,
    });

    const gastoGuardado = await this.gastoRepository.save(nuevoGasto);

    return Result.ok<Gasto>(gastoGuardado, 'Gasto registrado exitosamente.');
  }

  async findByProyectoUuid(proyectoUuid: string): Promise<Result<Gasto[]>> {
    const gastos = await this.gastoRepository.find({
      where: { proyecto: { uuid: proyectoUuid } },
      relations: {
        usuario: true
      },
      order: { creadoEl: 'DESC' },
    });

    // Mapeamos los gastos para firmar las imágenes
    const gastosFirmados = await Promise.all(
      gastos.map(async (gasto) => {
        if (gasto.imagenUrl) {
          gasto.imagenUrl = await this.storageService.obtenerUrlFirmada(gasto.imagenUrl);
        }
        return gasto;
      })
    );

    return Result.ok<Gasto[]>(gastosFirmados, 'Gastos obtenidos con éxito.');
  }
}