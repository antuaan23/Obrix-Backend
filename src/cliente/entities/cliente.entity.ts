import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Generated, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Entity('clientes')

export class Cliente {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid!: string;

    @Column({ type: 'varchar', length: 25 })
    nombre!: string;

    @Column({ type: 'varchar', length: 25})
    ap_paterno!: string;

    @Column({ type: 'varchar', length: 25 })
    ap_materno!: string;

    @Column({ unique: true})
    email!: string;

    @Column({ type: 'varchar', length: 12 }) 
    telefono!: string;

    @CreateDateColumn({ type: 'timestamp', name: 'creado_el' })
    creadoEl!: Date

    @Column({ type: 'boolean', default: true })
    activo: boolean = true;

    @ManyToOne(() => Usuario, (usuario) => usuario.clientes, {
        onDelete: 'SET NULL'
    })
    @JoinColumn({name: 'usuario_id'})
    usuario!: Usuario;

    @OneToMany(() => Proyecto, (proyecto) => proyecto.cliente)
    proyectos!: Proyecto[]

}
