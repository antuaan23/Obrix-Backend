import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Gasto } from './entities/gasto.entity';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { Result } from '../common/interfaces/result';
import {
  StorageService,
  ArchivoSubido,
} from '../common/services/storage.service';
import { MailService } from 'src/mail/mail.service';
import { MailTemplate } from 'src/mail/mail-template.enum';
import { RolEnum } from 'src/rol/rol.enum';

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

    private readonly mailService: MailService,
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
        return Result.fallo<Gasto>(
          'No se pudo guardar el archivo del comprobante.',
        );
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

    await this.mailService.enviarCorreo({
      plantilla: MailTemplate.GASTO_CREADO,
      to: usuario.email,
      subject: 'Nuevo Gasto',
      contexto: {
        nombreProyecto: proyecto.nombre,
        monto: dto.monto,
        nombreUsuario: `${usuario.nombre} ${usuario.ap_paterno}`,
        nombreGasto: gastoGuardado.nombre,
        fechaCreacion: new Date(gastoGuardado.creadoEl).toLocaleDateString(),
      },
    });

    return Result.ok<Gasto>(gastoGuardado, 'Gasto registrado exitosamente.');
  }

  async findByProyectoUuid(proyectoUuid: string): Promise<Result<Gasto[]>> {
    const gastos = await this.gastoRepository.find({
      where: { proyecto: { uuid: proyectoUuid } },
      relations: {
        usuario: true,
      },
      order: { creadoEl: 'DESC' },
    });

    // Mapeamos los gastos para firmar las imágenes
    const gastosFirmados = await Promise.all(
      gastos.map(async (gasto) => {
        if (gasto.imagenUrl) {
          gasto.imagenUrl = await this.storageService.obtenerUrlFirmada(
            gasto.imagenUrl,
          );
        }
        return gasto;
      }),
    );

    return Result.ok<Gasto[]>(gastosFirmados, 'Gastos obtenidos con éxito.');
  }

  /**
   * Elimina un gasto físicamente.
   * Solo puede eliminarlo el usuario que lo creó o un Admin.
   */
  async eliminar(
    uuid: string,
    usuarioUuid: string,
    rolId: number,
  ): Promise<Result<boolean>> {
    const gasto = await this.gastoRepository.findOne({
      where: { uuid },
      relations: { usuario: true },
    });

    if (!gasto) {
      return Result.fallo<boolean>('Gasto no encontrado.');
    }

    const esAdmin = rolId === RolEnum.ADMIN;
    const esCreador = gasto.usuario?.uuid === usuarioUuid;

    if (!esAdmin && !esCreador) {
      return Result.fallo<boolean>(
        'No tienes permiso para eliminar este gasto.',
      );
    }

    // Si tiene imagen en storage, eliminarla
    if (gasto.imagenUrl) {
      try {
        await this.storageService.eliminarArchivo(gasto.imagenUrl);
      } catch {
        // No bloqueamos la eliminación si falla el storage
      }
    }

    await this.gastoRepository.remove(gasto);
    return Result.ok<boolean>(true, 'Gasto eliminado correctamente.');
  }
}
