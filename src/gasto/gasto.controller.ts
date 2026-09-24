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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

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
  @UseInterceptors(FileInterceptor('imagen'))
  async create(
    @Body() dto: CreateGastoDto,
    @GetUser('uuid') usuarioUuid: string,
    @UploadedFile() file?: any,
  ) {
    const result = await this.gastoService.create(dto, usuarioUuid, file);

    // 👈 Si el Result viene con fallo, lanzamos una excepción HTTP de NestJS
    if (!result.exitoso) {
      throw new BadRequestException(result.descripcion);
    }

    return result;
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Obtener un gasto por su UUID' })
  async findByUuid(@Param('uuid') uuid: string) {
    const result = await this.gastoService.findByProyectoUuid(uuid);

    if (!result.exitoso) {
      throw new NotFoundException(result.descripcion);
    }

    return result;
  }
}