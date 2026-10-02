import { UpdateClienteDto } from 'src/cliente/dto/update-cliente.dto';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Generated, OneToMany, UpdateDateColumn, ManyToMany, OneToOne, JoinColumn, ManyToOne} from 'typeorm';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Equipo } from 'src/equipo/entities/equipo.entity';
import { Rol } from 'src/rol/entities/rol.entity';

@Entity('usuarios')

export class Usuario {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid!: string;

    @Column({type: 'varchar', length: 10, unique: true })
    rut!: string;

    @Column({type: 'varchar', length: 25 })
    nombre!: string;

    @Column({type: 'varchar', length: 25 })
    ap_paterno!: string;

    @Column({type: 'varchar', length: 25, nullable: true })
    ap_materno!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ select: false, type: 'varchar', length: 250 })
    password!: string;

    @Column({type: 'varchar', length: 12, nullable: true })
    telefono!: string;

    @CreateDateColumn({ type: 'timestamp',  })
    creado_el!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    actualizado_el!: Date

    @Column({ type: 'boolean', default: true })
    activo!: boolean;

    @OneToMany(() => Cliente, (cliente) => cliente.usuario)
    clientes!: Cliente[]

    @ManyToMany(() => Proyecto, (proyecto) => proyecto.usuarios)
    proyectos!: Proyecto[];

    @ManyToOne(() => Equipo, (equipo) => equipo.usuarios, { nullable: true })
    @JoinColumn({ name: 'equipo_id' })
    equipo!: Equipo;

    @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true, nullable: false })
    @JoinColumn({ name: 'rol_id' }) 
    rol!: Rol;
}
