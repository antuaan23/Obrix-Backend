import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    ManyToMany,
    JoinTable,
    JoinColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    Generated, 
    OneToMany 
  } from "typeorm";
  import { Cliente } from "../../cliente/entities/cliente.entity";
  import { Gasto } from "src/gasto/entities/gasto.entity";
  import { Trabajador } from "src/trabajador/entities/trabajador.entity"; // Importar Trabajador
  
  @Entity('proyectos')
  export class Proyecto {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ unique: true })
    @Generated('uuid')
    uuid!: string;
  
    @Column({ type: 'varchar', length: 50 })
    nombre!: string;
  
    @ManyToOne(() => Cliente, (cliente) => cliente.proyectos, {
      onDelete: 'CASCADE',
      nullable: true,
    })
    @JoinColumn({ name: 'cliente_id' })
    cliente?: Cliente;
  
    @OneToMany(() => Gasto, (gasto) => gasto.proyecto)
    gastos!: Gasto[];
  
    // Relación con múltiples trabajadores
    @ManyToMany(() => Trabajador, (trabajador) => trabajador.proyectos)
    @JoinTable({
      name: 'proyectos_trabajadores', // Nombre de la tabla pivote/intermedia
      joinColumn: { name: 'proyecto_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'trabajador_id', referencedColumnName: 'id' }
    })
    trabajadores!: Trabajador[];
  
    @CreateDateColumn({ name: 'creado_el' })
    creadoEl!: Date;
  
    @UpdateDateColumn({ name: 'actualizado_el' })
    actualizadoEl!: Date;
  }