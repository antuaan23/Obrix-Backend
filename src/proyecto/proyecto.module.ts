import { Module } from '@nestjs/common';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto } from './entities/proyecto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Gasto } from 'src/gasto/entities/gasto.entity';
import { MailModule} from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto, Cliente, Usuario, Gasto]),
    MailModule 
  ],
  controllers: [ProyectoController],
  providers: [ProyectoService],
  exports: [ProyectoService],
})
export class ProyectoModule {}
