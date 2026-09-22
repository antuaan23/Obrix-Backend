import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
export class CreateUsuarioDto {

    @ApiProperty({
        description: 'Correo del usuario',
        example: 'k.mbappe10@gmail.com'
    })
    @IsEmail()
    @IsNotEmpty()    
    email!: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: '12345678'
    })
    @IsString()
    @IsNotEmpty()
    password!: string;

}
