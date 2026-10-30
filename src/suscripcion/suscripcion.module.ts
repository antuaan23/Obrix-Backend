import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suscripcion } from './entities/suscripcion.entity';
import { SuscripcionService } from './suscripcion.service';
import { SuscripcionController } from './suscripcion.controller';
import { PlanModule } from 'src/plan/plan.module';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Suscripcion, Usuario, Proyecto, Cliente]),
        PlanModule,
    ],
    controllers: [SuscripcionController],
    providers: [SuscripcionService],
    exports: [SuscripcionService],
})
export class SuscripcionModule { }

