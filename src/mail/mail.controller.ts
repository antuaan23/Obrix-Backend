import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { Result } from 'src/common/interfaces/result';
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
  async enviarCorreo(
    @Body() dto: SendMailDto,
  ): Promise<Result<boolean>> {
    return await this.mailService.enviarCorreo(dto);
  }
}