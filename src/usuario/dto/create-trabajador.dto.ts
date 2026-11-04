import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTrabajadorDto {

    @ApiProperty({
        description: 'RUT del trabajador',
        example: '12345678-9'
    })
    @IsString()
    @IsNotEmpty()
    rut!: string;

    @ApiProperty({
        description: 'Nombre del trabajador',
        example: 'Carlos'
    })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({
        description: 'Apellido paterno del trabajador',
        example: 'González'
    })
    @IsString()
    @IsNotEmpty()
    ap_paterno!: string;

    @ApiPropertyOptional({
        description: 'Apellido materno del trabajador',
        example: 'Muñoz'
    })
    @IsString()
    @IsOptional()
    ap_materno?: string;

    @ApiProperty({
        description: 'Correo del trabajador',
        example: 'carlos.gonzalez@empresa.cl'
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({
        description: 'Contraseña inicial del trabajador',
        example: 'password123'
    })
    @IsString()
    @IsNotEmpty()
    password!: string;

    @ApiProperty({
        description: 'Teléfono del trabajador',
        example: '+56912345678'
    })
    @IsString()
    @IsNotEmpty()
    telefono!: string;
}

