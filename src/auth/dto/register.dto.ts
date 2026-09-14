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
    apPaterno!: string;

    @ApiProperty({
        description: 'Apellido materno del trabajador',
        example: 'Cuccitini'
    })
    @IsString()
    @IsOptional()
    apMaterno!: string;

    @ApiProperty({
        description: 'Correo del trabajador',
        example: 'leo.messi10@gmail.com'
    })
    @IsEmail()
    @IsNotEmpty()
    correo!: string;

    @ApiProperty({
        description: 'Telefono del trabajador',
        example: '+56912345678'
    })
    @IsString()
    @IsNotEmpty()
    telefono!: string;

    @ApiProperty({
        description: 'Servicio que entrega el trabajador',
        example: 'Gasfitería'
    })
    @IsString()
    @IsNotEmpty()
    servicio!: string;

}
