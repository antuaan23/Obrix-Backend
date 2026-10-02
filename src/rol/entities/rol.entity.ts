import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Generated, OneToMany } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre!: string; // Ej: 'ADMIN', 'LIDER', 'TRABAJADOR'

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion!: string;

  @CreateDateColumn({ type: 'timestamp' })
  creado_el!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  actualizado_el!: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios!: Usuario[];
}