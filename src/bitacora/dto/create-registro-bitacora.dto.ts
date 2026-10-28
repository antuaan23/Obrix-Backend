import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRegistroBitacoraDto {
  @ApiProperty({
    description: 'UUID de la bitácora donde se registrará el avance',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  uuidBitacora!: string;

  @ApiProperty({
    description: 'Descripción del avance realizado',
    example: 'Se completó la instalación de tuberías en el primer piso.',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({
    description: 'Fecha en que se realizó el avance (YYYY-MM-DD)',
    example: '2025-02-10',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaRegistro!: string;
}
