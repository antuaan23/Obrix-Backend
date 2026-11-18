import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPagoWebpay } from '../entities/pago-webpay.entity';

export class FiltroPagosDto {
  @ApiPropertyOptional({
    enum: EstadoPagoWebpay,
    description: 'Filtrar por estado del pago (INICIADA, APROBADA, RECHAZADA, ANULADA)',
  })
  @IsOptional()
  @IsEnum(EstadoPagoWebpay)
  estado?: EstadoPagoWebpay;

  @ApiPropertyOptional({
    description: 'Búsqueda por orden de compra, RUT, nombre, apellido o email del usuario',
  })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID del Plan' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  planId?: number;

  @ApiPropertyOptional({ description: 'Fecha desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  fechaHasta?: string;

  @ApiPropertyOptional({ default: 1, description: 'Número de página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Cantidad de elementos por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite: number = 10;
}
