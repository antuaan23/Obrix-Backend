import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Avance } from '../entities/avance.entity';

export class UsuarioResumenAvanceDto {
  @ApiProperty({ example: '40391403-0d26-43a6-8a25-74a7ad718f45' })
  uuid!: string;

  @ApiProperty({ example: 'Nicolás' })
  nombre!: string;

  @ApiProperty({ example: 'Antú' })
  ap_paterno!: string;

  @ApiProperty({ example: 'ni.antugb@gmail.com' })
  email!: string;
}

export class AvanceResponseDto {
  @ApiProperty({ example: 'f030876f-7446-4c3b-856e-61701dbae830' })
  uuid!: string;

  @ApiProperty({ example: 'Adelanto de quincena' })
  concepto!: string;

  @ApiProperty({ example: 150000 })
  monto!: number;

  @ApiPropertyOptional({ example: 'https://storage.dev/avances/comprobante.jpg' })
  comprobanteUrl?: string;

  @ApiProperty({ type: UsuarioResumenAvanceDto })
  lider!: UsuarioResumenAvanceDto;

  @ApiProperty({ type: UsuarioResumenAvanceDto })
  trabajador!: UsuarioResumenAvanceDto;

  @ApiProperty({ example: '2026-10-27T23:30:01.313Z' })
  creadoEl!: Date;

  static fromEntity(avance: Avance): AvanceResponseDto {
    return {
      uuid: avance.uuid,
      concepto: avance.concepto,
      monto: Number(avance.monto),
      comprobanteUrl: avance.comprobanteUrl,
      lider: avance.lider
        ? {
            uuid: avance.lider.uuid,
            nombre: avance.lider.nombre,
            ap_paterno: avance.lider.ap_paterno,
            email: avance.lider.email,
          }
        : undefined as any,
      trabajador: avance.trabajador
        ? {
            uuid: avance.trabajador.uuid,
            nombre: avance.trabajador.nombre,
            ap_paterno: avance.trabajador.ap_paterno,
            email: avance.trabajador.email,
          }
        : undefined as any,
      creadoEl: avance.creadoEl,
    };
  }
}
