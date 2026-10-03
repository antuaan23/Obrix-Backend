import { ApiProperty } from '@nestjs/swagger';

export class CotizacionResumenPresupuestoDto {
  @ApiProperty({ example: '72da7299-cc9d-480c-8c19-c68d4dc88c26' })
  uuid!: string;

  @ApiProperty({ example: 'Materiales de gasfitería' })
  nombre!: string;

  @ApiProperty({ example: 250000, description: 'Monto total de la cotización en CLP' })
  montoTotal!: number;
}

export class PresupuestoCalculadoDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  uuid!: string;

  @ApiProperty({ example: 'Remodelación Oficinas' })
  nombre!: string;

  @ApiProperty({
    example: 2,
    description: 'Cantidad de cotizaciones que se sumaron para el presupuesto',
  })
  cantidadCotizaciones!: number;

  @ApiProperty({
    example: 750000,
    description: 'Presupuesto del proyecto = suma de montoTotal de todas sus cotizaciones',
  })
  presupuesto!: number;

  @ApiProperty({ type: [CotizacionResumenPresupuestoDto] })
  cotizaciones!: CotizacionResumenPresupuestoDto[];
}
