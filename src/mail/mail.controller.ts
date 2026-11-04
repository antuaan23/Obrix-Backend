import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolEnum } from 'src/rol/rol.enum';

@ApiTags('Correo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('correo')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('enviar')
  @Roles(RolEnum.ADMIN, RolEnum.LIDER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar un correo electrónico (Líderes o Admin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Correo enviado exitosamente.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error al procesar o enviar el correo.' 
  })
  async enviarCorreo(@Body() dto: SendMailDto) {
    const res = await this.mailService.enviarCorreo(dto);

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
}
