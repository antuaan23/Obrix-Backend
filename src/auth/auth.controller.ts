import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UnauthorizedException, 
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/resetear-pass.dto'; // O tu ruta de reset-password.dto
import { VerificarCodigoDto } from './dto/verificar-codigo.dto';
import { CambiarPassDto } from './dto/cambiar-pass.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'El correo electrónico ya se encuentra registrado.' })
  async register(@Body() registerDto: RegisterDto) {
    const res = await this.authService.registro(registerDto);

    if (!res.exitoso) {
      throw new BadRequestException({
        exitoso: res.exitoso,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: LoginDto) {
    const res = await this.authService.login(loginDto);

    if (!res.exitoso) {
      throw new UnauthorizedException({
        exitoso: res.exitoso,
        descripcion: res.descripcion,
      });
    }

    return {
      exitoso: res.exitoso,
      descripcion: res.descripcion,
      respuesta: res.resultado,
    };
  }

  // PASO 1: Solicitar código de recuperación
  @Post('solicitar-recuperacion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({ status: 200, description: 'Código enviado exitosamente' })
  async solicitarRecuperacion(@Body() dto: ResetPasswordDto) {
    const res = await this.authService.solicitarRecuperacion(dto);

    if (!res.exitoso) {
      throw new BadRequestException({ exitoso: res.exitoso, descripcion: res.descripcion });
    }

    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  // PASO 2: Verificar si el código ingresado es correcto
  @Post('verificar-codigo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código de recuperación de contraseña' })
  @ApiResponse({ status: 200, description: 'Código verificado correctamente' })
  async verificarCodigo(@Body() dto: VerificarCodigoDto) {
    const res = await this.authService.verificarCodigo(dto);

    if (!res.exitoso) {
      throw new BadRequestException({ exitoso: res.exitoso, descripcion: res.descripcion });
    }

    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }

  // PASO 3: Cambiar la contraseña de forma definitiva
  @Post('cambiar-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña con el proceso completado' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente.' })
  async cambiarPassword(@Body() dto: CambiarPassDto) {
    const res = await this.authService.cambiarPasswordConCodigo(dto);

    if (!res.exitoso) {
      throw new BadRequestException({ exitoso: res.exitoso, descripcion: res.descripcion });
    }

    return { exitoso: res.exitoso, descripcion: res.descripcion, respuesta: res.resultado };
  }
}