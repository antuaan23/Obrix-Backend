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
  import { Usuario } from "src/usuario/entities/usuario.entity";
import { Proyecto } from "src/proyecto/entities/proyecto.entity";
import { DetalleCotizacion } from "./detalle-cotizacion.entity";
  
  @Entity('cotizaciones')
  export class Cotizacion {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid!: string;
  
    @Column({ type: 'varchar', length: 50 })
    nombre!: string;

    @ManyToOne(() => Proyecto, (proyecto) => proyecto.cotizaciones, { onDelete: 'CASCADE' })
    proyecto!: Proyecto;

    // Una cotización tiene varios ítems/materiales cotizados
    @OneToMany(() => DetalleCotizacion, (detalle) => detalle.cotizacion, { cascade: true })
    detalles!: DetalleCotizacion[];

    @Column({type: 'int'})
    montoTotal!: number;
  
    @CreateDateColumn({ type: 'timestamp' , name: 'creado_el' })
    creadoEl!: Date;
  
    @UpdateDateColumn({ type: 'timestamp' , name: 'actualizado_el' })
    actualizadoEl!: Date;
  }