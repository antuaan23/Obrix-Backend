import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@ApiTags('Planes')
@Controller('plan')
export class PlanController {

    constructor(private readonly planService: PlanService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos los planes activos' })
    findAll() {
        return this.planService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un plan por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.planService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo plan (admin)' })
    create(@Body() dto: CreatePlanDto) {
        return this.planService.create(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Editar límites y precios de un plan (admin)' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
        return this.planService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Desactivar un plan (admin)' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.planService.remove(id);
    }
}

