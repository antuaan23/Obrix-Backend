import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Plan } from 'src/plan/entities/plan.entity';

export enum EstadoPagoWebpay {
  INICIADA = 'INICIADA',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  ANULADA = 'ANULADA',
}

@Entity('pagos_webpay')
export class PagoWebpay {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'buy_order' })
  buyOrder!: string;

  @Column({ type: 'varchar', length: 100, name: 'session_id' })
  sessionId!: string;

  @Column({ type: 'int' })
  monto!: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'token_ws' })
  tokenWs?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoPagoWebpay.INICIADA,
  })
  estado!: EstadoPagoWebpay;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'codigo_autorizacion' })
  codigoAutorizacion?: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'ultimos_digitos_tarjeta' })
  ultimosDigitosTarjeta?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'tipo_pago' })
  tipoPago?: string;

  @Column({ type: 'int', nullable: true, name: 'numero_cuotas' })
  numeroCuotas?: number;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL', nullable: true, eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Plan, { onDelete: 'SET NULL', nullable: true, eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan!: Plan;

  @CreateDateColumn({ type: 'timestamp', name: 'creado_el' })
  creadoEl!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'actualizado_el' })
  actualizadoEl!: Date;
}
