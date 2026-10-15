import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class ResetPasswordDto {
@ApiProperty({
        description: 'Email del usuario que desea recuperar contraseña.',
        example: 'juanperez@gmail.com',
    })
@IsEmail()
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

}