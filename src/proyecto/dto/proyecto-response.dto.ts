import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Proyecto } from "../entities/proyecto.entity";

export class ClienteResumenDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  uuid!: string;

  @ApiProperty({ example: 'Neymar Jr' })
  nombre!: string;

  @ApiProperty({ example: 'neymar@gmail.com' })
  email!: string;
}

export class TrabajadorResumenDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  uuid!: string;

  @ApiProperty({ example: 'trabajador@gmail.com' })
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

  @ApiProperty({ type: [TrabajadorResumenDto] })
  trabajadores!: TrabajadorResumenDto[];

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
            email: proyecto.cliente.email,
          }
        : undefined,
      trabajadores:
        proyecto.trabajadores?.map((t) => ({
          uuid: t.uuid,
          email: t.email,
          activo: t.activo,
        })) || [],
    };
  }
}