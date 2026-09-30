import { DetalleCotizacion } from "src/cotizacion/entities/detalle-cotizacion.entity";
import { Column, Generated, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity('materiales')
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column('int')
  precio!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca!: string;

  @OneToMany(() => DetalleCotizacion, (detalle) => detalle.material)
  detallesCotizacion!: DetalleCotizacion[];
}