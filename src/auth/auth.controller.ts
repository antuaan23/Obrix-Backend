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
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'El correo electrónico ya se encuentra registrado.',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso. Retorna el token de acceso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o cuenta de usuario inactiva.',
  })
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
}