import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';
import { Bitacora } from './entities/bitacora.entity';
import { RegistroBitacora } from './entities/registro-bitacora.entity';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bitacora, RegistroBitacora, Proyecto, Usuario]),
  ],
  controllers: [BitacoraController],
  providers: [BitacoraService],
  exports: [BitacoraService],
})
export class BitacoraModule {}
