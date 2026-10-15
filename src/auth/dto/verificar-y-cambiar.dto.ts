// dto/verificar-y-cambiar-password.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerificarYCambiarPasswordDto {
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @IsNotEmpty({ message: 'El código de verificación es obligatorio' })
  @IsString()
  codigo!: string;

  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  nuevaPassword!: string;
}