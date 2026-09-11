import { Cliente } from "../../cliente/entities/cliente.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Generated} from "typeorm";

@Entity('proyectos')

export class Proyecto {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    @Generated('uuid')
    uuid!: string;

    @Column({type: 'varchar', length: 50})
    nombre!: string;

    @ManyToOne(() => Cliente, (cliente) => cliente.proyectos, {
        onDelete: 'CASCADE'
    })

    @JoinColumn({name: 'cliente_id'})
    cliente!: Cliente
}
