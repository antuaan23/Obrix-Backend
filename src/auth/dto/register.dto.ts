import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class RegisterDto {

    @ApiProperty({
        description: 'RUT del trabajador',
        example: '12345678-9'
    })
    @IsString()
    @IsNotEmpty()
    rut!: string;

    @ApiProperty({
        description: 'Nombre del trabajador',
        example: 'Leo'
    })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({
        description: 'Apellido paterno del trabajador',
        example: 'Messi'
    })
    @IsString()
    @IsNotEmpty()
    ap_paterno!: string;

    @ApiProperty({
        description: 'Apellido materno del trabajador',
        example: 'Cuccitini'
    })
    @IsString()
    @IsOptional()
    ap_materno!: string;

    @ApiProperty({
        description: 'Correo del trabajador',
        example: 'leo.messi10@gmail.com'
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({
        description: 'Contraseña del trabajdor',
        example: '12345678'
    })
    @IsString()
    @IsNotEmpty()
    password!: string;

    @ApiProperty({
        description: 'Telefono del trabajador',
        example: '+56912345678'
    })
    @IsString()
    @IsNotEmpty()
    telefono!: string;

}
