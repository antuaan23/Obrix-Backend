import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
export class CreateTrabajadorDto {

    @ApiProperty({
        description: 'Correo del trabajador',
        example: 'k.mbappe10@gmail.com'
    })
    @IsEmail()
    @IsNotEmpty()    
    email!: string;

    @ApiProperty({
        description: 'Contraseña del trabajador',
        example: '12345678'
    })
    @IsString()
    @IsNotEmpty()
    password!: string;

}
