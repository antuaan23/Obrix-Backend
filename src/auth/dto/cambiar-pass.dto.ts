import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CambiarPassDto {
  @ApiProperty({ description: 'Nueva contraseña', example: '87654321' })
  @IsNotEmpty({ message: 'La nueva contraseña no puede estar vacía' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  nuevaPassword!: string;

  @ApiProperty({ description: 'Confirmación de la contraseña', example: '87654321' })
  @IsNotEmpty({ message: 'La confirmación no puede estar vacía' })
  @MinLength(6, { message: 'La confirmación debe tener al menos 6 caracteres' })
  confirmarNuevaPassword!: string;

  @ApiPropertyOptional({ description: 'Confirmación alternativa (sin r)', example: '87654321' })
  @IsOptional()
  @MinLength(6)
  confirmaNuevaPassword?: string;

  @ApiPropertyOptional({ description: 'Token de restablecimiento (opcional si se envía por header Authorization: Bearer)', example: 'eyJhbGciOi...' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiPropertyOptional({ description: 'Código OTP (opcional para compatibilidad)', example: '781141' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({ description: 'Correo (opcional)', example: 'correo@ejemplo.com' })
  @IsOptional()
  email?: string;
}
