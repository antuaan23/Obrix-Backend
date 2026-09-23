import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from './entities/usuario.entity';
import { Result } from 'src/common/interfaces/result';
import { NotFoundError } from 'rxjs';
import { UsuarioDto } from './dto/usuario-response.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Result<UsuarioDto[]>> {
    const usuarios = await this.usuarioRepository.find({
      select: {
        uuid: true,
        rut: true,
        nombre: true,
        ap_paterno: true, // o apPaterno según la Opción elegida
        ap_materno: true,
        email: true,
        telefono: true,
        activo: true
      }
    });
  
    return Result.ok(usuarios, 'Lista de usuarios obtenida correctamente');
  }

  async findOne(uuid: string): Promise<Result<UsuarioDto>> {
    const usuario = await this.usuarioRepository.findOneBy({ uuid });
  
    if (!usuario) {
      return Result.fallo<UsuarioDto>('usuario no encontrado'); 
    }
    const usuarioDto: UsuarioDto = {
      uuid: usuario.uuid,
      rut: usuario.rut,
      nombre: usuario.nombre,
      ap_paterno: usuario.ap_paterno,
      ap_materno: usuario.ap_materno,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      creado_el: usuario.creado_el,
      actualizado_el: usuario.actualizado_el,
    };
  
    return Result.ok<UsuarioDto>(usuarioDto, `usuario ${usuario.uuid} encontrado correctamente`);
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
