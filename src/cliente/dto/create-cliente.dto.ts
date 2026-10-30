import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class CreateClienteDto {

    @ApiProperty({
        description: 'Nombre del cliente',
        example: 'Kylian'
    })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({
        description: 'Apellido paterno del cliente',
        example: 'Mbappé',
    })
    @IsString()
    @IsNotEmpty()
    ap_paterno!: string;

    @ApiProperty({
        description: 'Apellido materno del cliente',
        example: 'Mbappé'
    })
    @IsString()
    @IsOptional()
    ap_materno!: string;

    @ApiProperty({
        description: 'RUT del cliente en formato XXXXXXXX-X',
        example: '20392017-2'
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{7,8}-[\dkK]$/, { message: 'El RUT debe tener el formato XXXXXXXX-X (ej: 20392017-2)' })
    rut!: string;

    @ApiProperty({
        description: 'Correo del cliente',
        example: 'k.mbappe10@gmail.com'
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'Número del cliente',
        example: '+56912345678'
    })
    @IsString()
    telefono!: string;
}
