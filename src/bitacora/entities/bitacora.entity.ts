import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  Generated,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { RegistroBitacora } from './registro-bitacora.entity';

@Entity('bitacoras')
export class Bitacora {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'date', name: 'fecha_inicio' })
  fechaInicio!: Date;

  @Column({ type: 'date', name: 'fecha_estimada_termino' })
  fechaEstimadaTermino!: Date;

  @OneToOne(() => Proyecto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proyecto_id' })
  proyecto!: Proyecto;

  @OneToMany(() => RegistroBitacora, (registro) => registro.bitacora, {
    cascade: true,
  })
  registros!: RegistroBitacora[];

  @CreateDateColumn({ type: 'timestamp', name: 'creado_el' })
  creadoEl!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'actualizado_el' })
  actualizadoEl!: Date;
}
