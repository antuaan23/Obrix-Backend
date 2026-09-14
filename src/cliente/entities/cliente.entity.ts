import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Generated, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';

@Entity('clientes')

export class Cliente {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    @Generated('uuid')
    uuid!: string;

    @Column({ unique: true })
    nombre!: string;

    @Column()
    appaterno!: string;

    @Column()
    apmaterno!: string;

    @Column()
    email!: string;

    @Column()
    telefono!: string;

    @CreateDateColumn()
    creadoEl!: Date

    @Column({ type: 'boolean', default: true })
    activo: boolean = true;

    @ManyToOne(() => Trabajador, (trabajador) => trabajador.clientes, {
        onDelete: 'SET NULL'
    })
    @JoinColumn({name: 'trabajador_id'})
    trabajador!: Trabajador;

    @OneToMany(() => Proyecto, (proyecto) => proyecto.cliente)
    proyectos!: Proyecto[]

}
