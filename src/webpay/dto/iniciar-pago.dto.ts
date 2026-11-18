import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class IniciarPagoDto {
  @ApiProperty({
    example: 2,
    description: 'ID numérico del plan que se desea contratar o renovar',
  })
  @IsInt()
  @IsNotEmpty()
  planId!: number;

  @ApiPropertyOptional({
    example: 'http://localhost:5173/planes/confirmacion',
    description: 'URL de retorno del frontend a la que redirigir tras finalizar el pago (opcional)',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  returnUrlFront?: string;
}
