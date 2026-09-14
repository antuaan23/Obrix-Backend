import { Proyecto } from "../entities/proyecto.entity";

export class ProyectoResponseDto {
    uuid!: string;
    nombre!: string;
    creadoEl!: Date;
    cliente?: {
      uuid: string;
      nombre: string;
      email: string;
    };
    trabajadores!: {
      uuid: string;
      email: string;
      activo: boolean;
    }[];
  
    static fromEntity(proyecto: Proyecto): ProyectoResponseDto {
      return {
        uuid: proyecto.uuid,
        nombre: proyecto.nombre,
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