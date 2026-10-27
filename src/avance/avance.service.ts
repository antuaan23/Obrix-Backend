import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Avance } from './entities/avance.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateAvanceDto } from './dto/create-avance.dto';
import { Result } from '../common/interfaces/result';
import { StorageService, ArchivoSubido } from '../common/services/storage.service';

@Injectable()
export class AvanceService {
  constructor(
    @InjectRepository(Avance)
    private readonly avanceRepository: Repository<Avance>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    private readonly storageService: StorageService,
  ) {}

  async create(
    dto: CreateAvanceDto,
    liderUuid: string,
    file?: ArchivoSubido,
  ): Promise<Result<Avance>> {
    // 1. Validar que el líder existe
    const lider = await this.usuarioRepository.findOne({
      where: { uuid: liderUuid },
    });

    if (!lider) {
      return Result.fallo<Avance>('El líder autenticado no fue encontrado.');
    }

    // 2. Validar que el trabajador existe
    const trabajador = await this.usuarioRepository.findOne({
      where: { uuid: dto.trabajadorId },
    });

    if (!trabajador) {
      return Result.fallo<Avance>('El trabajador especificado no existe.');
    }

    // 3. Validar que el trabajador pertenece al líder
    if (trabajador.liderId !== lider.id) {
      return Result.fallo<Avance>('El trabajador no pertenece a tu equipo.');
    }

    // 4. Subir comprobante a storage si se adjuntó
    let comprobanteUrl: string | undefined;

    if (file) {
      try {
        comprobanteUrl = await this.storageService.subirBoleta(file, 'avances');
      } catch {
        return Result.fallo<Avance>('No se pudo guardar el comprobante del avance.');
      }
    }

    // 5. Guardar el avance
    const nuevoAvance = this.avanceRepository.create({
      concepto: dto.concepto,
      monto: dto.monto,
      comprobanteUrl,
      lider,
      trabajador,
    });

    const avanceGuardado = await this.avanceRepository.save(nuevoAvance);

    return Result.ok<Avance>(avanceGuardado, 'Avance registrado exitosamente.');
  }

  // Todos los avances que el líder ha registrado a sus trabajadores
  async findByLider(liderUuid: string): Promise<Result<Avance[]>> {
    const avances = await this.avanceRepository.find({
      where: { lider: { uuid: liderUuid } },
      relations: { trabajador: true, lider: true },
      order: { creadoEl: 'DESC' },
    });

    const avancesFirmados = await Promise.all(
      avances.map(async (a) => {
        if (a.comprobanteUrl) {
          a.comprobanteUrl = await this.storageService.obtenerUrlFirmada(a.comprobanteUrl);
        }
        return a;
      }),
    );

    return Result.ok<Avance[]>(avancesFirmados, 'Avances del líder obtenidos.');
  }

  // Todos los avances recibidos por un trabajador
  async findByTrabajador(trabajadorUuid: string): Promise<Result<Avance[]>> {
    const avances = await this.avanceRepository.find({
      where: { trabajador: { uuid: trabajadorUuid } },
      relations: { lider: true },
      order: { creadoEl: 'DESC' },
    });

    const avancesFirmados = await Promise.all(
      avances.map(async (a) => {
        if (a.comprobanteUrl) {
          a.comprobanteUrl = await this.storageService.obtenerUrlFirmada(a.comprobanteUrl);
        }
        return a;
      }),
    );

    return Result.ok<Avance[]>(avancesFirmados, 'Avances del trabajador obtenidos.');
  }
}
