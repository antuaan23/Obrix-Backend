import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Suscripcion } from 'src/suscripcion/entities/suscripcion.entity';

@Entity('planes')
export class Plan {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 50 })
    nombre!: string;

    /** Precio mensual base en pesos CLP */
    @Column({ type: 'int' })
    precio_base!: number;

    /** Cantidad de proyectos incluidos antes de cobrar excedente */
    @Column({ type: 'int' })
    proyectos_incluidos!: number;

    /** Cantidad de trabajadores incluidos antes de cobrar excedente. null = sin cobro extra */
    @Column({ type: 'int', nullable: true })
    trabajadores_incluidos!: number | null;

    /** Cantidad de clientes incluidos antes de cobrar excedente. null = sin cobro extra */
    @Column({ type: 'int', nullable: true })
    clientes_incluidos!: number | null;

    /** Precio extra por cada proyecto sobre el umbral incluido. null = sin cobro */
    @Column({ type: 'int', nullable: true })
    precio_extra_proyecto!: number | null;

    /** Precio extra por cada trabajador sobre el umbral incluido. null = sin cobro */
    @Column({ type: 'int', nullable: true })
    precio_extra_trabajador!: number | null;

    /** Precio extra por cada cliente sobre el umbral incluido. null = sin cobro */
    @Column({ type: 'int', nullable: true })
    precio_extra_cliente!: number | null;

    @Column({ type: 'boolean', default: true })
    activo: boolean = true;

    @OneToMany(() => Suscripcion, (suscripcion) => suscripcion.plan)
    suscripciones!: Suscripcion[];
}

