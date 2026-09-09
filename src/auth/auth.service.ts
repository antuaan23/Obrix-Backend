import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    private readonly jwtService: JwtService,
  ) {}

  // REGISTRO
  async registro(createUsuarioDto: CreateUsuarioDto) {
    const { email, password } = createUsuarioDto;

    // 1. Verificar si el correo ya existe
    const existeUsuario = await this.trabajadorRepository.findOne({ where: { email } });
    if (existeUsuario) {
      throw new BadRequestException('El usuario ya está registrado');
    }

    // 2. Encriptar contraseña (salt factor = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear y guardar nuevo usuario
    const nuevoUsuario = this.trabajadorRepository.create({
      email,
      password: hashedPassword,
      activo: true
    });
    await this.trabajadorRepository.save(nuevoUsuario);

    // 4. Excluir el password de la respuesta devuelta por seguridad
    const { password: _, ...result } = nuevoUsuario;
    return result;
  }

  // LOGIN
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar usuario
    const usuario = await this.trabajadorRepository.findOne({ where: { email } });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar contraseña con bcrypt
    const esPasswordValida = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar JWT Token
    const payload = { sub: usuario.id, email: usuario.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}