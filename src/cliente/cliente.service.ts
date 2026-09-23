import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ClienteResponseDto } from './dto/proyecto-response.dto';
import { Result } from 'src/common/interfaces/result';

@Injectable()
export class ClienteService {

  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>
  ){}

  async findOne(uuid: string): Promise<Result<ClienteResponseDto>> {
    const cliente = await this.clienteRepository.findOne({
      where : { uuid },
      relations: {
        usuario: true
      },
    })
    if (!cliente) {
      return Result.fallo<ClienteResponseDto>('Proyecto no encontrado.');
    }

    return Result.ok(ClienteResponseDto.fromEntity(cliente), 'Proyecto encontrado.');
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    return `This action updates a #${id} cliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} cliente`;
  }
}
