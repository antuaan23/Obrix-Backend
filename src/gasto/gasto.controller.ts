import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile 
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
    @UploadedFile() file?: any, // 👈 Al poner 'any', eliminas la dependencia del namespace de Multer
  ) {
    return await this.gastoService.create(dto, usuarioUuid, file);
  }
}