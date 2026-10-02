import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Generated, OneToMany, UpdateDateColumn, ManyToMany, OneToOne} from 'typeorm';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Entity('equipos')

export class Equipo {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid!: string;

    @Column({type: 'varchar', length: 25 })
    nombre!: string;

    @CreateDateColumn({ type: 'timestamp',  })
    creado_el!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    actualizado_el!: Date

    @Column({ type: 'boolean', default: true })
    activo!: boolean;

    @OneToMany(() => Proyecto, (proyecto) => proyecto.usuarios)
    proyectos!: Proyecto[];

    @OneToMany(() => Usuario, (usuario) => usuario.equipo)
    usuarios!: Usuario[];
}
