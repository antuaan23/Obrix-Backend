import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvanceService } from './avance.service';
import { AvanceController } from './avance.controller';
import { Avance } from './entities/avance.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { StorageService } from 'src/common/services/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Avance, Usuario])],
  controllers: [AvanceController],
  providers: [AvanceService, StorageService],
})
export class AvanceModule {}
