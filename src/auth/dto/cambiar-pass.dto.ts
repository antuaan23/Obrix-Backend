import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CambiarPassDto {
    @ApiProperty({ description: 'Correo electrónico', example: 'ni.antugb@gmail.com' })
    @IsEmail()
    email!: string;
  
    @ApiProperty({ description: 'Código OTP recibido por correo', example: '781141' })
    @IsNotEmpty()
    @IsString()
    codigo!: string; // <-- EXIGIMOS EL CÓDIGO AQUÍ TAMBIÉN
  
    @ApiProperty({ description: 'Nueva contraseña', example: '87654321' })
    @IsNotEmpty()
    @MinLength(6)
    nuevaPassword!: string;
  
    @ApiProperty({ description: 'Confirmación de la contraseña', example: '87654321' })
    @IsNotEmpty()
    @MinLength(6)
    confirmaNuevaPassword!: string;
  }