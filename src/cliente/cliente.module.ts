import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { Cliente } from './entities/cliente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente, Usuario]), 
  ],
  controllers: [ClienteController],
  providers: [ClienteService],
})
export class ClienteModule {}
