import { Module } from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { TrabajadorController } from './trabajador.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from './entities/trabajador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trabajador]), 
  ],
  controllers: [TrabajadorController],
  providers: [TrabajadorService],
})
export class TrabajadorModule {}
