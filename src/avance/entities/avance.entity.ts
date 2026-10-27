import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Generated,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('avances')
export class Avance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  // Concepto o motivo del avance (ej: "Adelanto quincena", "Materiales urgentes")
  @Column({ type: 'varchar', length: 150 })
  concepto!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto!: number;

  // URL del comprobante (opcional, subido a storage)
  @Column({ type: 'varchar', nullable: true })
  comprobanteUrl?: string;

  // Líder que registra el avance
  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'lider_id' })
  lider?: Usuario;

  // Trabajador que recibe el avance
  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true, eager: false })
  @JoinColumn({ name: 'trabajador_id' })
  trabajador!: Usuario;

  @CreateDateColumn({ type: 'timestamp', name: 'creado_el' })
  creadoEl!: Date;
}
