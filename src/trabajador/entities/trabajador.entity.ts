import { UpdateClienteDto } from 'src/cliente/dto/update-cliente.dto';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Generated, OneToMany, UpdateDateColumn, ManyToMany} from 'typeorm';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';

@Entity('trabajadores')

export class Trabajador {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    @Generated('uuid')
    uuid!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @CreateDateColumn()
    creadoEl!: Date

    @UpdateDateColumn()
    actualizadoEl!: Date

    @Column()
    activo!: boolean;

    @OneToMany(() => Cliente, (cliente) => cliente.trabajador)
    clientes!: Cliente[]

    @ManyToMany(() => Proyecto, (proyecto) => proyecto.trabajadores)
    proyectos!: Proyecto[];
}
