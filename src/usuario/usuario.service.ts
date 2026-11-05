import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Result } from 'src/common/interfaces/result';
import { UsuarioDto } from './dto/usuario-response.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { RolEnum } from 'src/rol/rol.enum';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  private mapearUsuarioDto(usuario: Usuario): UsuarioDto {
    return {
      uuid: usuario.uuid,
      rut: usuario.rut,
      nombre: usuario.nombre,
      ap_paterno: usuario.ap_paterno,
      ap_materno: usuario.ap_materno,
      email: usuario.email,
      telefono: usuario.telefono,
      rolId: usuario.rol?.id,
      rolNombre: usuario.rol?.nombre,
      rol: usuario.rol
        ? {
            id: usuario.rol.id,
            nombre: usuario.rol.nombre,
            descripcion: usuario.rol.descripcion,
          }
        : undefined,
      plan: usuario.suscripcion?.plan
        ? {
            id: usuario.suscripcion.plan.id,
            nombre: usuario.suscripcion.plan.nombre,
            precio_base: usuario.suscripcion.plan.precio_base,
          }
        : undefined,
      activo: usuario.activo,
      creado_el: usuario.creado_el,
      actualizado_el: usuario.actualizado_el,
    };
  }

  async findAll(): Promise<Result<UsuarioDto[]>> {
    const usuarios = await this.usuarioRepository.find({
      relations: {
        rol: true,
        suscripcion: {
          plan: true,
        },
      },
      order: {
        creado_el: 'DESC',
      },
    });

    const usuariosDto = usuarios.map((u) => this.mapearUsuarioDto(u));
    return Result.ok(usuariosDto, 'Lista de usuarios obtenida correctamente');
  }

  async findOne(uuid: string): Promise<Result<UsuarioDto>> {
    const usuario = await this.usuarioRepository.findOne({
      where: { uuid },
      relations: {
        rol: true,
        suscripcion: {
          plan: true,
        },
      },
    });

    if (!usuario) {
      return Result.fallo<UsuarioDto>('Usuario no encontrado');
    }

    return Result.ok<UsuarioDto>(
      this.mapearUsuarioDto(usuario),
      `Usuario ${usuario.uuid} encontrado correctamente`,
    );
  }

  /**
   * Actualizar únicamente correo electrónico y/o número telefónico
   */
  async update(uuid: string, dto: UpdateUsuarioDto): Promise<Result<UsuarioDto>> {
    const usuario = await this.usuarioRepository.findOne({
      where: { uuid },
      relations: {
        rol: true,
        suscripcion: {
          plan: true,
        },
      },
    });

    if (!usuario) {
      return Result.fallo<UsuarioDto>('Usuario no encontrado.');
    }

    if (dto.email && dto.email.toLowerCase() !== usuario.email.toLowerCase()) {
      const emailExistente = await this.usuarioRepository.findOne({
        where: { email: dto.email.toLowerCase() },
      });

      if (emailExistente && emailExistente.uuid !== usuario.uuid) {
        return Result.fallo<UsuarioDto>('El correo electrónico ya se encuentra registrado por otro usuario.');
      }
      usuario.email = dto.email.toLowerCase();
    }

    if (dto.telefono !== undefined) {
      usuario.telefono = dto.telefono;
    }

    await this.usuarioRepository.save(usuario);

    return Result.ok<UsuarioDto>(
      this.mapearUsuarioDto(usuario),
      'Usuario actualizado exitosamente.',
    );
  }

  async crearTrabajador(liderId: number, dto: CreateTrabajadorDto): Promise<Result<Omit<Usuario, 'password'>>> {
    const { rut, nombre, ap_paterno, ap_materno, email, password, telefono } = dto;

    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [{ email }, { rut }],
    });

    if (usuarioExistente) {
      const mensaje =
        usuarioExistente.email === email
          ? 'El correo electrónico ya está registrado.'
          : 'El RUT ya se encuentra registrado.';
      return Result.fallo<Omit<Usuario, 'password'>>(mensaje);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoTrabajador = this.usuarioRepository.create({
      rut,
      nombre,
      ap_paterno,
      ap_materno,
      email,
      password: hashedPassword,
      telefono,
      rol: { id: RolEnum.TRABAJADOR } as any,
      liderId: liderId,
      activo: true,
    });

    await this.usuarioRepository.save(nuevoTrabajador);

    const { password: _, ...usuarioSinPassword } = nuevoTrabajador;
    return Result.ok(usuarioSinPassword, 'Trabajador registrado exitosamente.');
  }

  async obtenerTrabajadoresPorLider(liderId: number): Promise<Result<UsuarioDto[]>> {
    const trabajadores = await this.usuarioRepository.find({
      where: { liderId },
      relations: { rol: true, suscripcion: { plan: true } },
      order: { creado_el: 'DESC' },
    });

    const dtos = trabajadores.map((t) => this.mapearUsuarioDto(t));
    return Result.ok(dtos, 'Trabajadores obtenidos correctamente.');
  }

  /**
   * Borrado lógico: Desactiva el usuario en lugar de eliminarlo físicamente
   */
  async remove(uuid: string): Promise<Result<boolean>> {
    const usuario = await this.usuarioRepository.findOne({ where: { uuid } });

    if (!usuario) {
      return Result.fallo<boolean>('Usuario no encontrado.');
    }

    usuario.activo = false;
    await this.usuarioRepository.save(usuario);
    return Result.ok(true, 'Usuario desactivado exitosamente.');
  }

  /**
   * Cambiar estado activo/inactivo (Borrado / Reactivación lógica)
   */
  async cambiarEstado(uuid: string, activo: boolean): Promise<Result<UsuarioDto>> {
    const usuario = await this.usuarioRepository.findOne({ where: { uuid } });

    if (!usuario) {
      return Result.fallo<UsuarioDto>('Usuario no encontrado.');
    }

    usuario.activo = activo;
    await this.usuarioRepository.save(usuario);

    return this.findOne(uuid);
  }
}
