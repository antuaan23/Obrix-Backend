import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Generated,
  CreateDateColumn,
} from 'typeorm';
import { Bitacora } from './bitacora.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Entity('registros_bitacora')
export class RegistroBitacora {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'date', name: 'fecha_registro' })
  fechaRegistro!: Date;

  @ManyToOne(() => Bitacora, (bitacora) => bitacora.registros, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bitacora_id' })
  bitacora!: Bitacora;

  @ManyToOne(() => Usuario, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @CreateDateColumn({ type: 'timestamp', name: 'creado_el' })
  creadoEl!: Date;
}
