import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToOne, 
    JoinColumn 
  } from "typeorm";
  import { Proyecto } from "../../proyecto/entities/proyecto.entity"; // Ajusta la ruta a tu entidad Proyecto
  
  @Entity('gastos')
  export class Gasto {
    @PrimaryGeneratedColumn('uuid')
    uuid!: string;
  
    @Column({ type: 'varchar', length: 150 })
    nombre!: string;
  
    @Column({ type: 'text' })
    descripcion!: string;
  
    // Guarda la URL o ruta local del archivo de comprobante
    @Column({ type: 'varchar', nullable: true })
    imagenUrl?: string;
  
    // Relación Muchos a Uno con la entidad Proyecto
    @ManyToOne(() => Proyecto, (proyecto) => proyecto.gastos, { 
      onDelete: 'CASCADE' // Si se elimina el proyecto, se eliminan sus gastos
    })
    @JoinColumn({ name: 'proyecto_id' }) // Crea la columna clave foránea 'proyecto_id' en la tabla
    proyecto!: Proyecto;
  
    @CreateDateColumn({ type: 'timestamp', name: 'creado_el' })
    creadoEl!: Date;
  }