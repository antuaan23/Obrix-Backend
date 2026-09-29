import { Column, Generated, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('materiales')
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'text' })
  precio!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca!: string;
}