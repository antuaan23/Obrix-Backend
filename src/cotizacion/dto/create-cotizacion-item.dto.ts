import { 
  IsUUID, 
  IsNotEmpty, 
  IsNumber, 
  IsPositive, 
  IsOptional, 
  Min 
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCotizacionItemDto {
  @ApiProperty({
    description: 'UUID del material a cotizar',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
  })
  @IsUUID()
  @IsNotEmpty()
  materialUuid!: string;

  @ApiProperty({
    description: 'Cantidad del material requerido',
    example: 10
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  cantidad!: number;

  @ApiProperty({
    description: 'Precio unitario personalizado (opcional, si se omite usa el precio del catálogo)',
    example: 5500,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  precioUnitario?: number;
}