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
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

import { GastoService } from './gasto.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Gastos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gastos')
export class GastoController {
  constructor(private readonly gastoService: GastoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo gasto con comprobante' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Gasto registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al registrar el gasto o datos inválidos.' })
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: CreateGastoDto,
    @GetUser('uuid') usuarioUuid: string,
    @UploadedFile() file?: any,
  ) {
    const result = await this.gastoService.create(dto, usuarioUuid, file);

    if (!result.exitoso) {
      throw new BadRequestException({
        exitoso: result.exitoso,
        descripcion: result.descripcion,
      });
    }

    return {
      exitoso: result.exitoso,
      descripcion: result.descripcion,
      respuesta: result.resultado,
    };
  }

  @Get('proyecto/:proyectoUuid')
  @ApiOperation({ summary: 'Obtener todos los gastos asociados a un proyecto' })
  @ApiResponse({ status: 200, description: 'Gastos obtenidos exitosamente.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado o sin gastos.' })
  async findByProyectoUuid(@Param('proyectoUuid') proyectoUuid: string) {
    const result = await this.gastoService.findByProyectoUuid(proyectoUuid);

    if (!result.exitoso) {
      throw new NotFoundException({
        exitoso: result.exitoso,
        descripcion: result.descripcion,
      });
    }

    return {
      exitoso: result.exitoso,
      descripcion: result.descripcion,
      respuesta: result.resultado,
    };
  }
}