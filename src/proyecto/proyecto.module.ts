import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto } from './entities/proyecto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto, Cliente, Trabajador]), 
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService],
})
export class ProyectoModule {}
