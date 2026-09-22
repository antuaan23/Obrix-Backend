import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UsuarioDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID único del usuario' })
  uuid!: string;

  @ApiProperty({ example: '12345678-9', description: 'RUT del usuario' })
  rut!: string;

  @ApiProperty({ example: 'Leo', description: 'Nombre del usuario' })
  nombre!: string;

  @ApiProperty({ example: 'Messi', description: 'Apellido paterno del usuario' })
  ap_paterno!: string;

  @ApiPropertyOptional({ example: 'Cuccittini', description: 'Apellido materno del usuario' })
  ap_materno?: string;

  @ApiProperty({ example: 'leo.messi10@gmail.com', description: 'Correo electrónico' })
  email!: string;

  @ApiPropertyOptional({ example: '+56912345678', description: 'Teléfono de contacto' })
  telefono?: string;

  @ApiProperty({ example: true, description: 'Estado de la cuenta del usuario' })
  activo!: boolean;

  @ApiProperty({ example: '2026-09-15T00:00:00.000Z', description: 'Fecha de creación' })
  creado_el!: Date;

  @ApiProperty({ example: '2026-09-15T00:00:00.000Z', description: 'Fecha de última actualización' })
  actualizado_el!: Date;
}

export class UsuarioResponseDto {
  @ApiProperty({ example: true })
  exitoso!: boolean;

  @ApiProperty({ example: 'Usuario obtenido exitosamente' })
  descripcion!: string;

  @ApiProperty({ type: UsuarioDto })
  respuesta!: UsuarioDto;
}

export class UsuarioListResponseDto {
  @ApiProperty({ example: true })
  exitoso!: boolean;

  @ApiProperty({ example: 'Lista de usuarios obtenida correctamente' })
  descripcion!: string;

  @ApiProperty({ type: [UsuarioDto] })
  respuesta!: UsuarioDto[];
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  exitoso!: boolean;

  @ApiProperty({ example: 'Error al consultar la base de datos' })
  descripcion!: string;
}