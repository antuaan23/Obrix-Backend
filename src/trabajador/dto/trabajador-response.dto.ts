
import { ApiProperty } from '@nestjs/swagger';

export class TrabajadorDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  uuid!: string;

  @ApiProperty({ example: 'juan.perez@email.com' })
  email!: string;

  @ApiProperty({ example: true })
  activo!: boolean;
}

export class TrabajadorListResponseDto {
  @ApiProperty({ example: true })
  exitoso!: boolean;

  @ApiProperty({ example: 'Lista de trabajadores obtenida correctamente' })
  descripcion!: string;

  @ApiProperty({ type: [TrabajadorDto] })
  respuesta!: TrabajadorDto[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  exitoso!: boolean;

  @ApiProperty({ example: 'Error al consultar la base de datos' })
  descripcion!: string;
}