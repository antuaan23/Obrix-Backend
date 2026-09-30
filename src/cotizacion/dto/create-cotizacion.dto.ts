import { 
  IsUUID, 
  IsNotEmpty, 
  IsArray, 
  ValidateNested, 
  ArrayMinSize, 
  IsString
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CreateCotizacionItemDto } from "./create-cotizacion-item.dto";

export class CreateCotizacionDto {
  @ApiProperty({
    description: 'UUID del proyecto asociado a la cotización',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  proyectoUuid!: string;

  @ApiProperty({
    description: 'nombre de la cotización',
    example: 'Cotización Oficinas'
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    description: 'Lista de materiales con sus cantidades y precios',
    type: [CreateCotizacionItemDto] // Indica a Swagger que es un arreglo de este DTO
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCotizacionItemDto)
  @IsNotEmpty()
  items!: CreateCotizacionItemDto[];
}