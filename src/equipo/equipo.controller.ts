import { Controller, Get, Post, Body, Param, NotFoundException, BadRequestException, InternalServerErrorException, HttpStatus, HttpCode } from '@nestjs/common';
import { EquipoService } from './equipo.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';

@Controller('equipos')
export class EquipoController {
  constructor(private readonly equipoService: EquipoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEquipoDto: CreateEquipoDto) {
    const resultado = await this.equipoService.create(createEquipoDto);

    if (!resultado.exitoso) {
      // Si el líder o los trabajadores no existen / error de validación de negocio
      throw new BadRequestException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado._resultado,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const resultado = await this.equipoService.findAll();

    if (!resultado.exitoso) {
      throw new InternalServerErrorException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado._resultado,
    };
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('uuid') uuid: string) {
    const resultado = await this.equipoService.findOne(uuid);

    if (!resultado.exitoso) {
      throw new NotFoundException({
        exitoso: false,
        descripcion: resultado.descripcion,
      });
    }

    return {
      exitoso: resultado.exitoso,
      descripcion: resultado.descripcion,
      respuesta: resultado._resultado,
    };
  }
}