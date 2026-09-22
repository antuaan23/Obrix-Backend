import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class RegisterDto {

    @ApiProperty({
        description: 'RUT del usuario',
        example: '12345678-9'
    })
    @IsString()
    @IsNotEmpty()
    rut!: string;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Leo'
    })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({
        description: 'Apellido paterno del usuario',
        example: 'Messi'
    })
    @IsString()
    @IsNotEmpty()
    ap_paterno!: string;

    @ApiProperty({
        description: 'Apellido materno del usuario',
        example: 'Cuccitini'
    })
    @IsString()
    @IsOptional()
    ap_materno!: string;

    @ApiProperty({
        description: 'Correo del usuario',
        example: 'leo.messi10@gmail.com'
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

    @ApiProperty({
        description: 'Telefono del usuario',
        example: '+56912345678'
    })
    @IsString()
    @IsNotEmpty()
    telefono!: string;

}
