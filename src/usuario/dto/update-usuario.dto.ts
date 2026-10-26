import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({
    description: 'Nuevo correo electrónico del usuario',
    example: 'nuevo.correo@gmail.com',
  })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido.' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Nuevo teléfono de contacto del usuario',
    example: '+56912345678',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
  @MaxLength(12, { message: 'El teléfono no puede superar los 12 caracteres.' })
  @IsOptional()
  telefono?: string;
}
