import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGastoDto {
  @ApiProperty({
    description: 'Nombre o título corto del gasto',
    example: 'Compra de Vulcanita y Perfiles',
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    description: 'Descripción detallada del gasto',
    example: 'Planchas de vulcanita 15mm y montantes para tabiquería',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({
    description: 'Monto total del gasto en CLP',
    example: 45000,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  monto!: number;

  @ApiProperty({
    description: 'UUID del proyecto asociado',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  @IsNotEmpty()
  proyectoId!: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Archivo o comprobante del gasto',
  })
  @IsOptional()
  imagen?: any;
}