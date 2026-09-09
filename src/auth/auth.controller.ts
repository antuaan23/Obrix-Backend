import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateTrabajadorDto } from '../trabajador/dto/create-trabajador.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createTrabajadorDto: CreateTrabajadorDto) {
    return this.authService.registro(createTrabajadorDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}