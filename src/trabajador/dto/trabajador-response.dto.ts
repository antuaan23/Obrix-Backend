import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrabajadorDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID único del trabajador' })
  uuid!: string;

  @ApiProperty({ example: '12345678-9', description: 'RUT del trabajador' })
  rut!: string;

  @ApiProperty({ example: 'Leo', description: 'Nombre del trabajador' })
  nombre!: string;

  @ApiProperty({ example: 'Messi', description: 'Apellido paterno del trabajador' })
  ap_paterno!: string;

  @ApiPropertyOptional({ example: 'Cuccittini', description: 'Apellido materno del trabajador' })
  ap_materno?: string;

  @ApiProperty({ example: 'leo.messi10@gmail.com', description: 'Correo electrónico' })
  email!: string;

  @ApiPropertyOptional({ example: '+56912345678', description: 'Teléfono de contacto' })
  telefono?: string;

  @ApiProperty({ example: true, description: 'Estado de la cuenta del trabajador' })
  activo!: boolean;

  @ApiProperty({ example: '2026-09-15T00:00:00.000Z', description: 'Fecha de creación' })
  creado_el!: Date;

  @ApiProperty({ example: '2026-09-15T00:00:00.000Z', description: 'Fecha de última actualización' })
  actualizado_el!: Date;
}

export class TrabajadorResponseDto {
  @ApiProperty({ example: true })
  exitoso!: boolean;

  @ApiProperty({ example: 'Trabajador obtenido exitosamente' })
  descripcion!: string;

  @ApiProperty({ type: TrabajadorDto })
  respuesta!: TrabajadorDto;
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