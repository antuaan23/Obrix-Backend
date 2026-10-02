import { DetalleCotizacion } from "src/cotizacion/entities/detalle-cotizacion.entity";
import { Column, Generated, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

@Entity('materiales')
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  @Column({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'varchar', length: 150 })
  producto!: string;

  @Column('int')
  precio_clp!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoria!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  origen!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca!: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  imagen!: string;

  @OneToMany(() => DetalleCotizacion, (detalle) => detalle.material)
  detallesCotizacion!: DetalleCotizacion[];
}