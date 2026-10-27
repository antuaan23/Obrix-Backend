import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

import { AvanceService } from './avance.service';
import { CreateAvanceDto } from './dto/create-avance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AvanceResponseDto } from './dto/avance-response.dto';

@ApiTags('Avances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('avances')
export class AvanceController {
  constructor(private readonly avanceService: AvanceService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un avance de dinero a un trabajador' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Avance registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al registrar el avance o datos inválidos.' })
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: CreateAvanceDto,
    @GetUser('uuid') liderUuid: string,
    @UploadedFile() file?: any,
  ) {
    const result = await this.avanceService.create(dto, liderUuid, file);

    if (!result.exitoso) {
      throw new BadRequestException({
        exitoso: result.exitoso,
        descripcion: result.descripcion,
      });
    }

    return {
      exitoso: result.exitoso,
      descripcion: result.descripcion,
      respuesta: result.resultado ? AvanceResponseDto.fromEntity(result.resultado) : null,
    };
  }

  @Get('mis-avances')
  @ApiOperation({ summary: 'Obtener todos los avances registrados por el líder autenticado' })
  @ApiResponse({ status: 200, description: 'Avances obtenidos exitosamente.' })
  async findByLider(@GetUser('uuid') liderUuid: string) {
    const result = await this.avanceService.findByLider(liderUuid);

    if (!result.exitoso) {
      throw new NotFoundException({
        exitoso: result.exitoso,
        descripcion: result.descripcion,
      });
    }

    return {
      exitoso: result.exitoso,
      descripcion: result.descripcion,
      respuesta: result.resultado?.map(AvanceResponseDto.fromEntity),
    };
  }

  @Get('trabajador/:uuid')
  @ApiOperation({ summary: 'Obtener todos los avances recibidos por un trabajador' })
  @ApiResponse({ status: 200, description: 'Avances del trabajador obtenidos exitosamente.' })
  async findByTrabajador(@Param('uuid') trabajadorUuid: string) {
    const result = await this.avanceService.findByTrabajador(trabajadorUuid);

    if (!result.exitoso) {
      throw new NotFoundException({
        exitoso: result.exitoso,
        descripcion: result.descripcion,
      });
    }

    return {
      exitoso: result.exitoso,
      descripcion: result.descripcion,
      respuesta: result.resultado?.map(AvanceResponseDto.fromEntity),
    };
  }
}
