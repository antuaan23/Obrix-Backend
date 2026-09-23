import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Cliente } from "../entities/cliente.entity";

export class ClienteResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  uuid!: string;

  @ApiProperty({ example: 'Neymar' })
  nombre!: string;

  @ApiProperty({ example: 'Santos' })
  ap_paterno!: string;

  @ApiProperty({ example: 'Júnior' })
  ap_materno!: string;

  @ApiProperty({ example: 'neymar@gmail.com' })
  email!: string;

  @ApiPropertyOptional({ example: '+56912345678' })
  telefono?: string;


  static fromEntity(cliente: Cliente): ClienteResponseDto {
    return {
      uuid: cliente.uuid,
      nombre: cliente.nombre,
      ap_paterno: cliente.ap_paterno,
      ap_materno: cliente.ap_materno,
      email: cliente.email,
      telefono: cliente.telefono,
    };
  }
}