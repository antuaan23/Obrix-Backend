import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUrl } from 'class-validator';

export class CrearTransaccionDto {
  @ApiProperty({ example: 'orden-123', description: 'ID único de la orden de compra' })
  @IsString()
  buyOrder: string;

  @ApiProperty({ example: 'sesion-123', description: 'ID de la sesión del usuario' })
  @IsString()
  sessionId: string;

  @ApiProperty({ example: 1000, description: 'Monto a cobrar en pesos chilenos' })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'http://localhost:3000/webpay/retorno',
    description: 'URL de retorno después del pago',
  })
  @IsUrl({ require_tld: false })
  returnUrl: string;
}
