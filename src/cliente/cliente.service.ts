import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class ClienteService {

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>
  ){}

  create(createClienteDto: CreateClienteDto) {
    return 'This action adds a new cliente';
  }



  findOne(id: number) {
    return `This action returns a #${id} cliente`;
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    return `This action updates a #${id} cliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} cliente`;
  }
}
