import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from "typeorm";
import { Proyecto } from "../../proyecto/entities/proyecto.entity";
import { Usuario } from "../../usuario/entities/usuario.entity";

@Entity('gastos')
export class Gasto {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  // NUEVO: Campo para el monto en dinero
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

  @Column({ type: 'varchar', nullable: true })
  imagenUrl?: string;

  // Relación con Proyecto
  @ManyToOne(() => Proyecto, (proyecto) => proyecto.gastos, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'proyecto_id' })
  proyecto!: Proyecto;

  // Relación con Usuario que registró el gasto
  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @CreateDateColumn({ type: 'timestamp', name: 'creado_el' })
  creadoEl!: Date;
}