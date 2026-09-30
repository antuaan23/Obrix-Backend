import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cotizacion } from './cotizacion.entity';
import { Material } from '../../material/entities/material.entity';

@Entity('detalles_cotizaciones')
export class DetalleCotizacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Cotizacion, (cotizacion) => cotizacion.detalles, { onDelete: 'CASCADE' })
  cotizacion!: Cotizacion;

  @ManyToOne(() => Material, (material) => material.detallesCotizacion)
  material!: Material;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidad!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;
}