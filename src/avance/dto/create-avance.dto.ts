import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvanceDto {
  @ApiProperty({
    description: 'Concepto o motivo del avance de dinero',
    example: 'Adelanto de quincena',
  })
  @IsString()
  @IsNotEmpty()
  concepto!: string;

  @ApiProperty({
    description: 'Monto del avance en CLP',
    example: 150000,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  monto!: number;

  @ApiProperty({
    description: 'UUID del trabajador que recibe el avance',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID()
  @IsNotEmpty()
  trabajadorId!: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Comprobante del avance (imagen o PDF)',
  })
  @IsOptional()
  comprobante?: any;
}
