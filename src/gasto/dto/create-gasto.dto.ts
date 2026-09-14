import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateGastoDto {
  @ApiProperty({
    description: 'Nombre del gasto',
    example: 'Vulcanita',
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    description: 'Descripción detallada del gasto',
    example: 'Planchas de vulcanita 15mm para tabiquería',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({
    description: 'UUID del proyecto al que pertenece el gasto',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  @IsNotEmpty()
  proyectoId!: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Comprobante o imagen del gasto (JPG, PNG, PDF)',
  })
  imagen?: any;
}