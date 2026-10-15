import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AgregarUsuarioProyectoDto {
    @ApiProperty({
        description: 'UUID del usuario que será agregado.',
        example: 'acb-11123421-234435-4444',
    })
  @IsNotEmpty({ message: 'El UUID del usuario es obligatorio' })
  @IsUUID('4', { message: 'El UUID del usuario debe ser un UUID válido' })
  uuidUsuario!: string;
}