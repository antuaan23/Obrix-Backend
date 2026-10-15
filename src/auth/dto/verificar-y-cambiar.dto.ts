// dto/verificar-y-cambiar-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerificarYCambiarPasswordDto {
  @ApiProperty({
    description: 'Email del usuario que desea recuperar contraseña.',
    example: 'juanperez@gmail.com',
  })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'Código de recuperación',
    example: '123456',
  })
  @IsNotEmpty({ message: 'El código de verificación es obligatorio' })
  @IsString()
  codigo!: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: '87654321',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  nuevaPassword!: string;
}