import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, CreateDateColumn } from 'typeorm';
import { Plan } from 'src/plan/entities/plan.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Entity('suscripciones')
export class Suscripcion {

    @PrimaryGeneratedColumn()
    id!: number;

    @CreateDateColumn({ type: 'timestamp', name: 'fecha_inicio' })
    fechaInicio!: Date;

    @Column({ type: 'timestamp', name: 'fecha_fin', nullable: true })
    fechaFin?: Date;

    @Column({ type: 'boolean', default: true })
    activa: boolean = true;

    @OneToOne(() => Usuario, (usuario) => usuario.suscripcion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuario_id' })
    usuario!: Usuario;

    @ManyToOne(() => Plan, (plan) => plan.suscripciones, { eager: true, nullable: false })
    @JoinColumn({ name: 'plan_id' })
    plan!: Plan;
}

