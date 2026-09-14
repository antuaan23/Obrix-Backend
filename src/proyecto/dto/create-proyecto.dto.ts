import { 
  IsString, 
  IsNotEmpty, 
  IsUUID, 
  IsOptional, 
  IsNumber, 
  ValidateNested 
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CreateClienteDto } from "src/cliente/dto/create-cliente.dto";

export class CreateProyectoDto {
  @ApiProperty({
    description: 'UUID del trabajador asignado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  uuidTrabajador!: string;

  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Remodelación Oficinas'
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    description: 'Servicio prestado en el proyecto',
    example: 'Gasfitería'
  })
  @IsString()
  @IsNotEmpty()
  servicio!: string;

  @ApiProperty({
    description: 'Datos para la creación del cliente',
    type: CreateClienteDto, // Indica a Swagger que es un objeto complejo
  })
  @ValidateNested() // Fuerza la validación de las reglas dentro de CreateClienteDto
  @Type(() => CreateClienteDto) // Convierte el JSON plano a una instancia de clase
  @IsNotEmpty()
  cliente!: CreateClienteDto;

  @ApiProperty({
    description: 'Presupuesto estimado del proyecto',
    example: 500000,
    required: false
  })
  @IsNumber()
  @IsOptional()
  presupuesto?: number;
}