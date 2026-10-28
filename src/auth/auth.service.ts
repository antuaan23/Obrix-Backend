import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Result } from 'src/common/interfaces/result';
import { Rol } from 'src/rol/entities/rol.entity';
import { RolEnum } from 'src/rol/rol.enum';
import { AuthPayload, PasswordChangedPayload } from './interfaces/auth.interface';
import { MailService } from 'src/mail/mail.service';
import { MailTemplate } from 'src/mail/mail-template.enum';
import { VerificarCodigoDto } from './dto/verificar-codigo.dto';
import { ResetPasswordDto } from './dto/resetear-pass.dto';
import { CambiarPassDto } from './dto/cambiar-pass.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    private readonly mailService: MailService
  ) { }

  // REGISTRO
  async registro(registerDto: RegisterDto): Promise<Result<Omit<Usuario, 'password'>>> {
    const { rut, nombre, ap_paterno, ap_materno, email, password, telefono } = registerDto;

    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [{ email }, { rut }],
    });

    if (usuarioExistente) {
      const mensaje = usuarioExistente.email === email
        ? 'El correo electrónico ya está registrado.'
        : 'El RUT ya se encuentra registrado.';
      return Result.fallo<Omit<Usuario, 'password'>>(mensaje);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = this.usuarioRepository.create({
      rut,
      nombre,
      ap_paterno,
      ap_materno,
      email,
      password: hashedPassword,
      telefono,
      rol: { id: RolEnum.LIDER } as any,
      activo: true,
    });

    await this.usuarioRepository.save(nuevoUsuario);

    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    return Result.ok(usuarioSinPassword, 'Usuario registrado exitosamente.');
  }

  // LOGIN
  async login(loginDto: LoginDto): Promise<Result<AuthPayload>> {
    const { email, password } = loginDto;

    // 1. Buscar usuario trayendo EXPLÍCITAMENTE la columna password que tiene { select: false }
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where('usuario.email = :email', { email })
      .getOne();

    if (!usuario) {
      return Result.fallo<AuthPayload>('Credenciales inválidas.');
    }

    // 2. Verificar si está activo
    if (!usuario.activo) {
      return Result.fallo<AuthPayload>('El usuario se encuentra inactivo.');
    }

    // 3. Verificar contraseña con bcrypt (ahora usuario.password tiene el hash)
    const esPasswordValida = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValida) {
      return Result.fallo<AuthPayload>('Credenciales inválidas.');
    }

    // 4. Generar JWT Token y retornar solo el payload esperado
    const payload = {
      sub: usuario.id,
      uuid: usuario.uuid,
      email: usuario.email,
      nombre: usuario.nombre,
      ap_paterno: usuario.ap_paterno,
      rol: usuario.rol?.nombre   // Solo el nombre del rol
    };

    const token = this.jwtService.sign(payload);

    return Result.ok<AuthPayload>(
      { access_token: token },
      'Inicio de sesión exitoso.'
    );
  }

  async solicitarRecuperacion(dto: ResetPasswordDto): Promise<Result<ResetPasswordDto>> {
    const { email } = dto;
    const usuario = await this.usuarioRepository.findOne({
      where: { email }
    });

    if (!usuario) {
      return Result.fallo<ResetPasswordDto>(`¡Mm, hay algo sospechoso... Si el correo realmente está registrado, se enviará el código de recuperación. `)
    }
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 15);

    usuario.codigoRecuperacion = codigo;
    usuario.codigoExpiracion = expiracion;
    await this.usuarioRepository.save(usuario);

    const resultadoCorreo = await this.mailService.enviarCorreo({
      to: usuario.email,
      subject: 'Codigo de recuperación - Obrix',
      plantilla: MailTemplate.RESESTABLECER_PASS,
      contexto: {
        nombre: usuario.nombre,
        codigo: codigo
      }
    })

    if (!resultadoCorreo) {
      return Result.fallo<ResetPasswordDto>(`No se pudo enviar el correo de recuperación.`)
    }

    return Result.ok<ResetPasswordDto>({ email: usuario.email }, 'Codigo de recuperación enviado exitosamente.')
  }

  async verificarCodigo(dto: VerificarCodigoDto): Promise<Result<{ email?: string }>> {
    const { email, codigo } = dto;

    // Buscamos directamente por el código si no viene el email
    const usuario = await this.usuarioRepository.findOne({
      where: email ? { email, codigoRecuperacion: codigo } : { codigoRecuperacion: codigo }
    });

    if (!usuario || !usuario.codigoRecuperacion || !usuario.codigoExpiracion) {
      return Result.fallo('Solicitud inválida o el código no pertenece a ninguna cuenta activa.');
    }

    if (new Date() > new Date(usuario.codigoExpiracion)) {
      return Result.fallo('El código de verificación ha expirado.');
    }

    return Result.ok(
      { email: usuario.email },
      'Código verificado correctamente'
    );
  }

  async cambiarPasswordConCodigo(dto: CambiarPassDto): Promise<Result<PasswordChangedPayload>> {
    const { email, codigo, nuevaPassword, confirmaNuevaPassword } = dto;

    if (nuevaPassword !== confirmaNuevaPassword) {
      return Result.fallo<PasswordChangedPayload>('Las contraseñas no coinciden.');
    }

    const usuario = await this.usuarioRepository.findOne({ where: { email } });

    // VALIDACIÓN DE SEGURIDAD: Si no tiene código activo o el código no coincide, se rechaza
    if (!usuario || !usuario.codigoRecuperacion || usuario.codigoRecuperacion !== codigo) {
      return Result.fallo<PasswordChangedPayload>('Petición no autorizada. El código de recuperación es inválido o no ha sido verificado.');
    }

    if (usuario.codigoExpiracion && new Date() > new Date(usuario.codigoExpiracion)) {
      return Result.fallo<PasswordChangedPayload>('El código de recuperación ha expirado.');
    }

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    usuario.password = hashedPassword;
    usuario.codigoRecuperacion = null as any;
    usuario.codigoExpiracion = null as any;
    await this.usuarioRepository.save(usuario);

    return Result.ok<PasswordChangedPayload>(
      { email: usuario.email },
      'Contraseña actualizada exitosamente.'
    );
  }
}