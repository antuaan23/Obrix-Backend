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
import { Trabajador } from "src/trabajador/entities/trabajador.entity";

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
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

  @ManyToMany(() => Trabajador, (trabajador) => trabajador.proyectos)
  @JoinTable({
    name: 'proyectos_trabajadores',
    joinColumn: { name: 'proyecto_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'trabajador_id', referencedColumnName: 'id' }
  })
  trabajadores!: Trabajador[];

  @CreateDateColumn({ name: 'creado_el' })
  creadoEl!: Date;

  @UpdateDateColumn({ name: 'actualizado_el' })
  actualizadoEl!: Date;
}