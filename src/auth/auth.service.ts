import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateTrabajadorDto } from '../trabajador/dto/create-trabajador.dto';
import { LoginDto } from './dto/login.dto';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
import { Result } from 'src/result'; // Ajusta la ruta según tu proyecto

export interface AuthPayload {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    private readonly jwtService: JwtService,
  ) {}

  // REGISTRO
  async registro(createTrabajadorDto: CreateTrabajadorDto): Promise<Result<Omit<Trabajador, 'password'>>> {
    const { email, password } = createTrabajadorDto;

    // 1. Verificar si el correo ya existe
    const existeUsuario = await this.trabajadorRepository.findOne({ where: { email } });
    if (existeUsuario) {
      return Result.fallo<Omit<Trabajador, 'password'>>('El usuario ya está registrado.');
    }

    // 2. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear y guardar nuevo usuario
    const nuevoUsuario = this.trabajadorRepository.create({
      email,
      password: hashedPassword,
      activo: true,
    });
    await this.trabajadorRepository.save(nuevoUsuario);

    // 4. Excluir password de la respuesta
    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    return Result.ok(usuarioSinPassword, 'Trabajador registrado exitosamente.');
  }

  // LOGIN
  async login(loginDto: LoginDto): Promise<Result<AuthPayload>> {
    const { email, password } = loginDto;

    // 1. Buscar usuario
    const usuario = await this.trabajadorRepository.findOne({ where: { email } });
    if (!usuario) {
      return Result.fallo<AuthPayload>('Credenciales inválidas.');
    }

    // 2. Verificar si está activo
    if (!usuario.activo) {
      return Result.fallo<AuthPayload>('El usuario se encuentra inactivo.');
    }

    // 3. Verificar contraseña con bcrypt
    const esPasswordValida = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValida) {
      return Result.fallo<AuthPayload>('Credenciales inválidas.');
    }

    // 4. Generar JWT Token y retornar Result.ok
    const payload = { sub: usuario.id, uuid: usuario.uuid, email: usuario.email };
    const token = this.jwtService.sign(payload);

    return Result.ok<AuthPayload>(
      { access_token: token },
      'Inicio de sesión exitoso.'
    );
  }
}