import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {

    @ApiProperty({ description: 'Nombre del plan', example: 'Independiente' })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({ description: 'Precio base mensual en CLP', example: 5750 })
    @IsInt()
    @Min(0)
    precio_base!: number;

    @ApiProperty({ description: 'Proyectos incluidos en el precio base', example: 20 })
    @IsInt()
    @Min(0)
    proyectos_incluidos!: number;

    @ApiPropertyOptional({ description: 'Trabajadores incluidos en el precio base (null = sin cobro extra)', example: 4 })
    @IsInt()
    @Min(0)
    @IsOptional()
    trabajadores_incluidos?: number | null;

    @ApiPropertyOptional({ description: 'Clientes incluidos en el precio base (null = sin cobro extra)', example: null })
    @IsInt()
    @Min(0)
    @IsOptional()
    clientes_incluidos?: number | null;

    @ApiPropertyOptional({ description: 'Precio extra por proyecto sobre el umbral (CLP)', example: 2500 })
    @IsInt()
    @Min(0)
    @IsOptional()
    precio_extra_proyecto?: number | null;

    @ApiPropertyOptional({ description: 'Precio extra por trabajador sobre el umbral (CLP)', example: 2000 })
    @IsInt()
    @Min(0)
    @IsOptional()
    precio_extra_trabajador?: number | null;

    @ApiPropertyOptional({ description: 'Precio extra por cliente sobre el umbral (CLP)', example: null })
    @IsInt()
    @Min(0)
    @IsOptional()
    precio_extra_cliente?: number | null;

    @ApiPropertyOptional({ description: 'Si el plan está disponible para elegir', example: true })
    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}

