// dto/verificar-y-cambiar-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class VerificarCodigoDto {
  @ApiProperty({
    description: 'Email del usuario que desea recuperar contraseña.',
    example: 'juanperez@gmail.com',
})
@IsEmail()
@IsOptional()
email!: string;
  @ApiProperty({
    description: 'Código de recuperación',
    example: '123456',
  })
  @IsNotEmpty({ message: 'El código de verificación es obligatorio' })
  @IsString()
  codigo!: string;

}