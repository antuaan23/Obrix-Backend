import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto'; // Importamos el RegisterDto ajustado
import { LoginDto } from './dto/login.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Result } from 'src/common/interfaces/result';

export interface AuthPayload {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  // REGISTRO
  async registro(registerDto: RegisterDto): Promise<Result<Omit<Usuario, 'password'>>> {
    const { rut, nombre, ap_paterno, ap_materno, email, password, telefono } = registerDto;

    // 1. Verificar si ya existe un usuario con el mismo email o RUT
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [{ email }, { rut }],
    });

    if (usuarioExistente) {
      const mensaje = usuarioExistente.email === email 
        ? 'El correo electrónico ya está registrado.' 
        : 'El RUT ya se encuentra registrado.';
      return Result.fallo<Omit<Usuario, 'password'>>(mensaje);
    }

    // 2. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear instancia con todos los datos recibidos del formulario
    const nuevoUsuario = this.usuarioRepository.create({
      rut,
      nombre,
      ap_paterno,
      ap_materno,
      email,
      password: hashedPassword,
      telefono,
      activo: true,
    });

    // 4. Guardar en base de datos
    await this.usuarioRepository.save(nuevoUsuario);

    // 5. Excluir password de la respuesta devuelta
    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    return Result.ok(usuarioSinPassword, 'Usuario registrado exitosamente.');
  }

  // LOGIN
  async login(loginDto: LoginDto): Promise<Result<AuthPayload>> {
    const { email, password } = loginDto;

    // 1. Buscar usuario
    const usuario = await this.usuarioRepository.findOne({ where: { email } });
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
    const payload = { sub: usuario.id, uuid: usuario.uuid, email: usuario.email, nombre: usuario.nombre, ap_paterno: usuario.ap_paterno };
    const token = this.jwtService.sign(payload);

    return Result.ok<AuthPayload>(
      { access_token: token },
      'Inicio de sesión exitoso.'
    );
  }
}