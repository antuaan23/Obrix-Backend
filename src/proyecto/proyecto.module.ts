import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto } from './entities/proyecto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto, Cliente, Usuario]), 
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService],
})
export class ProyectoModule {}
