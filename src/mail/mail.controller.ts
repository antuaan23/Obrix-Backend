import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';

@ApiTags('Correo')
@Controller('correo')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('enviar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar un correo electrónico genérico o de cotización' })
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