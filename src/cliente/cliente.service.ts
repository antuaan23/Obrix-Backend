import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './entities/cliente.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { Result } from 'src/common/interfaces/result';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findOne(uuid: string): Promise<Result<ClienteResponseDto>> {
    const cliente = await this.clienteRepository.findOne({
      where: { uuid },
      relations: {
        usuario: true,
      },
    });

    if (!cliente) {
      return Result.fallo<ClienteResponseDto>('Cliente no encontrado.');
    }

    return Result.ok(ClienteResponseDto.fromEntity(cliente), 'Cliente encontrado.');
  }

  async update(uuid: string, dto: UpdateClienteDto): Promise<Result<ClienteResponseDto>> {
    const cliente = await this.clienteRepository.findOne({ where: { uuid } });
    if (!cliente) {
      return Result.fallo<ClienteResponseDto>('Cliente no encontrado.');
    }

    if (dto.nombre) cliente.nombre = dto.nombre;
    if (dto.ap_paterno) cliente.ap_paterno = dto.ap_paterno;
    if (dto.ap_materno !== undefined) cliente.ap_materno = dto.ap_materno;
    if (dto.email) cliente.email = dto.email;
    if (dto.telefono) cliente.telefono = dto.telefono;

    const actualizado = await this.clienteRepository.save(cliente);
    return Result.ok(ClienteResponseDto.fromEntity(actualizado), 'Cliente actualizado correctamente.');
  }
}
