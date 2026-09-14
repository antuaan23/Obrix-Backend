import { Proyecto } from "../entities/proyecto.entity";

export class ProyectoResponseDto{
    uuid!: string;
    nombre!: string;
    creadoEl!: Date;
    trabajadores!: {
        uuid: string;
        email: string;
        activo: boolean
    }[];

    static fromEntity(proyecto: Proyecto): ProyectoResponseDto{
        return{
            uuid: proyecto.uuid,
            nombre: proyecto.nombre,
            creadoEl: proyecto.creadoEl,
            trabajadores: proyecto.trabajadores?.map((t) => ({
                uuid: t.uuid,
                email: t.email,
                activo: t.activo,
            })) || [],
        };
    }
}