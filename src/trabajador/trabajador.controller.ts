import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';

@Controller('trabajador')
export class TrabajadorController {
  constructor(private readonly trabajadorService: TrabajadorService) {}

  @Get()
  findAll() {
    return this.trabajadorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trabajadorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrabajadorDto: UpdateTrabajadorDto) {
    return this.trabajadorService.update(+id, updateTrabajadorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trabajadorService.remove(+id);
  }
}
