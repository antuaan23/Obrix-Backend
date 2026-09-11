import { IsString, IsNotEmpty, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Cliente } from "src/cliente/entities/cliente.entity";

export class CreateProyectoDto {

    @ApiProperty({
        description: 'Nombre del proyecto',
        example: 'Remodelación Oficinas'
    })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({
        description: 'UUID del cliente asociado al proyecto',
        example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    })
    @IsUUID()
    @IsNotEmpty()
    clienteId!: string;

}
