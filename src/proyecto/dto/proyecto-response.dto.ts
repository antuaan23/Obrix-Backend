import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Proyecto } from "../entities/proyecto.entity";

export class ClienteResumenDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  uuid!: string;

  @ApiProperty({ example: 'Neymar ' })
  nombre!: string;

  @ApiProperty({ example: 'Santos' })
  ap_paterno!: string;

  @ApiProperty({ example: 'Júnior' })
  ap_materno!: string;

  @ApiProperty({ example: 'neymar@gmail.com' })
  email!: string;

  @ApiProperty({ example: '+56912345678' })
  telefono!: string;
}

export class UsuarioResumenDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  uuid!: string;

  @ApiProperty({ example: 'usuario@gmail.com' })
  email!: string;

  @ApiProperty({ example: true })
  activo!: boolean;
}

export class ProyectoResponseDto {
  @ApiProperty({ example: '72da7299-cc9d-480c-8c19-c68d4dc88c26' })
  uuid!: string;

  @ApiProperty({ example: 'Remodelación Oficinas' })
  nombre!: string;

  @ApiProperty({ example: 'Gasfitería' })
  servicio!: string;

  @ApiPropertyOptional({ example: 500000 })
  presupuesto?: number;

  @ApiProperty({ example: '2026-09-14T01:15:29.728Z' })
  creadoEl!: Date;

  @ApiPropertyOptional({ type: ClienteResumenDto })
  cliente?: ClienteResumenDto;

  @ApiProperty({ type: [UsuarioResumenDto] })
  usuarios!: UsuarioResumenDto[];

  static fromEntity(proyecto: Proyecto): ProyectoResponseDto {
    return {
      uuid: proyecto.uuid,
      nombre: proyecto.nombre,
      servicio: proyecto.servicio,
      presupuesto: proyecto.presupuesto,
      creadoEl: proyecto.creadoEl,
      cliente: proyecto.cliente
        ? {
            uuid: proyecto.cliente.uuid,
            nombre: proyecto.cliente.nombre,
            ap_paterno: proyecto.cliente.ap_paterno,
            ap_materno: proyecto.cliente.ap_materno,
            email: proyecto.cliente.email,
            telefono: proyecto.cliente.telefono
          }
        : undefined,
      usuarios:
        proyecto.usuarios?.map((u) => ({
          uuid: u.uuid,
          email: u.email,
          activo: u.activo,
        })) || [],
    };
  }
}