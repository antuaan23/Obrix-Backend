import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gasto } from '../entities/gasto.entity';

export class UsuarioResumenGastoDto {
  @ApiProperty({ example: '40391403-0d26-43a6-8a25-74a7ad718f45' })
  uuid!: string;

  @ApiProperty({ example: 'Nicolás' })
  nombre!: string;

  @ApiProperty({ example: 'Godoy' })
  ap_paterno!: string;

  @ApiProperty({ example: 'ni.antugb@gmail.com' })
  email!: string;
}

export class GastoResponseDto {
  @ApiProperty({ example: 'f030876f-7446-4c3b-856e-61701dbae830' })
  uuid!: string;

  @ApiProperty({ example: 'Compra de Vulcanita y Perfiles' })
  nombre!: string;

  @ApiProperty({ example: 'Planchas de vulcanita 15mm y montantes para tabiquería' })
  descripcion!: string;

  @ApiProperty({ example: 45000 })
  monto!: number;

  @ApiPropertyOptional({ example: 'https://storage.dev/boletas/comprobante.jpg' })
  imagenUrl?: string;

  @ApiProperty({ type: UsuarioResumenGastoDto })
  usuario?: UsuarioResumenGastoDto;

  @ApiProperty({ example: '2026-10-27T23:30:01.313Z' })
  creadoEl!: Date;

  static fromEntity(gasto: Gasto): GastoResponseDto {
    return {
      uuid: gasto.uuid,
      nombre: gasto.nombre,
      descripcion: gasto.descripcion,
      monto: Number(gasto.monto),
      imagenUrl: gasto.imagenUrl,
      usuario: gasto.usuario
        ? {
            uuid: gasto.usuario.uuid,
            nombre: gasto.usuario.nombre,
            ap_paterno: gasto.usuario.ap_paterno,
            email: gasto.usuario.email,
          }
        : undefined,
      creadoEl: gasto.creadoEl,
    };
  }
}
