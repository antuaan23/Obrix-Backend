import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { CreateRegistroBitacoraDto } from './dto/create-registro-bitacora.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Bitácora')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) { }

  @Get('proyecto/:uuidProyecto')
  @ApiOperation({ summary: 'Obtener la bitácora de un proyecto con todos sus registros' })
  findByProyecto(@Param('uuidProyecto') uuidProyecto: string) {
    return this.bitacoraService.findByProyectoUuid(uuidProyecto);
  }

  @Post('registro')
  @ApiOperation({ summary: 'Agregar un registro de avance a la bitácora' })
  agregarRegistro(
    @Body() dto: CreateRegistroBitacoraDto,
    @Request() req: any,
  ) {
    const uuidUsuario: string = req.user.uuid;
    return this.bitacoraService.agregarRegistro(dto, uuidUsuario);
  }
}
