import { Module } from '@nestjs/common';
import { EquipoService } from './equipo.service';
import { EquipoController } from './equipo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from './entities/equipo.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipo, Usuario, Proyecto]), 
  ],
  controllers: [EquipoController],
  providers: [EquipoService],
})
export class EquipoModule {}
