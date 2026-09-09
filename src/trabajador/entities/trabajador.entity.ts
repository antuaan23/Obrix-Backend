import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Generated} from 'typeorm';

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

    @Column()
    activo!: boolean;


}
