import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  ManyToMany,
  JoinTable,
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Generated, 
  OneToMany 
} from "typeorm";
import { Cliente } from "../../cliente/entities/cliente.entity";
import { Gasto } from "src/gasto/entities/gasto.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  servicio!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  presupuesto?: number;

  // cascade: true permite insertar/guardar el cliente en la BD al guardar el proyecto
  @ManyToOne(() => Cliente, (cliente) => cliente.proyectos, {
    onDelete: 'CASCADE',
    cascade: true, 
    nullable: true,
  })
  @JoinColumn({ name: 'cliente_id' })
  cliente?: Cliente;

  @OneToMany(() => Gasto, (gasto) => gasto.proyecto)
  gastos!: Gasto[];

  @ManyToMany(() => Usuario, (usuario) => usuario.proyectos)
  @JoinTable({
    name: 'proyectos_usuarios',
    joinColumn: { name: 'proyecto_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'usuario_id', referencedColumnName: 'id' }
  })
  usuarios!: Usuario[];

  @CreateDateColumn({ type: 'timestamp' , name: 'creado_el' })
  creadoEl!: Date;

  @UpdateDateColumn({ type: 'timestamp' , name: 'actualizado_el' })
  actualizadoEl!: Date;
}