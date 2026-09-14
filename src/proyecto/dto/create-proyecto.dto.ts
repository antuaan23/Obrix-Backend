import { IsString, IsNotEmpty, IsUUID, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProyectoDto {
  @ApiProperty({
    description: 'UUID del trabajador',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  uuidTrabajador!: string;

  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Remodelación Oficinas'
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    description: 'UUID del cliente asociado al proyecto (Opcional en la creación)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    required: false
  })
  @IsUUID()
  @IsOptional()
  clienteId?: string;
}