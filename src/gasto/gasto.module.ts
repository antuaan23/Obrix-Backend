import { Module } from '@nestjs/common';
import { GastoService } from './gasto.service';
import { GastoController } from './gasto.controller';
import { Gasto } from './entities/gasto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { StorageService } from 'src/common/services/storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gasto, Usuario, Proyecto]), 
  ],
  controllers: [GastoController],
  providers: [GastoService, StorageService],
})
export class GastoModule {}
