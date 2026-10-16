import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; // <--- Importante para hashear la contraseña
import { Usuario } from './entities/usuario.entity';
import { Result } from 'src/common/interfaces/result';
import { UsuarioDto } from './dto/usuario-response.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RegisterDto } from 'src/auth/dto/register.dto'; // O la ruta donde tengas tu DTO de registro

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
        activo: true
      }
    });
  
    return Result.ok(usuarios, 'Lista de usuarios obtenida correctamente');
  }

  async findOne(uuid: string): Promise<Result<UsuarioDto>> {
    const usuario = await this.usuarioRepository.findOneBy({ uuid });
  
    if (!usuario) {
      return Result.fallo<UsuarioDto>('usuario no encontrado'); 
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
  
    return Result.ok<UsuarioDto>(usuarioDto, `usuario ${usuario.uuid} encontrado correctamente`);
  }

  // ==========================================
  // NUEVO MÉTODO: CREAR TRABAJADOR POR EL LÍDER
  // ==========================================
  async crearTrabajador(liderId: number, registerDto: RegisterDto): Promise<Result<Omit<Usuario, 'password'>>> {
    const { rut, nombre, ap_paterno, ap_materno, email, password, telefono } = registerDto;

    // 1. Validar si ya existe el usuario por email o rut
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [{ email }, { rut }],
    });

    if (usuarioExistente) {
      const mensaje = usuarioExistente.email === email 
        ? 'El correo electrónico ya está registrado.' 
        : 'El RUT ya se encuentra registrado.';
      return Result.fallo<Omit<Usuario, 'password'>>(mensaje);
    }

    // 2. Hashear la contraseña del trabajador
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el trabajador asociado al líder y con rol 3 (Trabajador)
    const nuevoTrabajador = this.usuarioRepository.create({
      rut,
      nombre,
      ap_paterno,
      ap_materno,
      email,
      password: hashedPassword,
      telefono,
      rol: { id: 3 },       // Rol 3 = Trabajador
      liderId: liderId,     // Vinculación directa con el ID del líder logueado
      activo: true,
    });

    await this.usuarioRepository.save(nuevoTrabajador);

    // Retornar sin exponer la contraseña
    const { password: _, ...usuarioSinPassword } = nuevoTrabajador;
    return Result.ok(usuarioSinPassword, 'Trabajador registrado exitosamente.');
  }

  // ==========================================
  // EXTRA: OBTENER SOLO LOS TRABAJADORES DE ESTE LÍDER
  // ==========================================
  async obtenerTrabajadoresPorLider(liderId: number): Promise<Result<Usuario[]>> {
    const trabajadores = await this.usuarioRepository.find({
      where: { liderId },
      relations: {rol: true}, // Para traer la info del rol si la necesitas
    });

    return Result.ok(trabajadores, 'Trabajadores obtenidos correctamente.');
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}