import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Result } from 'src/common/interfaces/result';
import { UsuarioDto } from './dto/usuario-response.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RolEnum } from 'src/rol/rol.enum';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Result<UsuarioDto[]>> {
    const usuarios = await this.usuarioRepository.find({
      select: {
        uuid: true,
        rut: true,
        nombre: true,
        ap_paterno: true,
        ap_materno: true,
        email: true,
        telefono: true,
        rol: true,
        activo: true,
      },
    });

    return Result.ok(usuarios, 'Lista de usuarios obtenida correctamente');
  }

  async findOne(uuid: string): Promise<Result<UsuarioDto>> {
    const usuario = await this.usuarioRepository.findOneBy({ uuid });

    if (!usuario) {
      return Result.fallo<UsuarioDto>('Usuario no encontrado');
    }

    const usuarioDto: UsuarioDto = {
      uuid: usuario.uuid,
      rut: usuario.rut,
      nombre: usuario.nombre,
      ap_paterno: usuario.ap_paterno,
      ap_materno: usuario.ap_materno,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      creado_el: usuario.creado_el,
      actualizado_el: usuario.actualizado_el,
    };

    return Result.ok<UsuarioDto>(usuarioDto, `Usuario ${usuario.uuid} encontrado correctamente`);
  }

  /**
   * Actualizar únicamente correo electrónico y/o número telefónico
   */
  async update(uuid: string, dto: UpdateUsuarioDto): Promise<Result<UsuarioDto>> {
    const usuario = await this.usuarioRepository.findOne({ where: { uuid } });

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

    const usuarioDto: UsuarioDto = {
      uuid: usuario.uuid,
      rut: usuario.rut,
      nombre: usuario.nombre,
      ap_paterno: usuario.ap_paterno,
      ap_materno: usuario.ap_materno,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      creado_el: usuario.creado_el,
      actualizado_el: usuario.actualizado_el,
    };

    return Result.ok<UsuarioDto>(usuarioDto, 'Usuario actualizado exitosamente.');
  }

  async crearTrabajador(liderId: number, registerDto: RegisterDto): Promise<Result<Omit<Usuario, 'password'>>> {
    const { rut, nombre, ap_paterno, ap_materno, email, password, telefono } = registerDto;

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

  async obtenerTrabajadoresPorLider(liderId: number): Promise<Result<Usuario[]>> {
    const trabajadores = await this.usuarioRepository.find({
      where: { liderId },
      relations: { rol: true },
    });

    return Result.ok(trabajadores, 'Trabajadores obtenidos correctamente.');
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