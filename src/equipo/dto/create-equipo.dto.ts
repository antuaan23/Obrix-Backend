import { IsString, IsNotEmpty, IsUUID, MaxLength, IsArray, ArrayMinSize } from 'class-validator';

export class CreateEquipoDto {
  @IsNotEmpty({ message: 'El nombre del equipo es obligatorio' })
  @IsString()
  @MaxLength(25, { message: 'El nombre no puede superar los 25 caracteres' })
  nombre!: string;

  @IsNotEmpty({ message: 'El UUID del líder es obligatorio' })
  @IsUUID('4', { message: 'El uuidUsuarioLider debe ser un UUID válido' })
  uuidUsuarioLider!: string;

  @IsArray({ message: 'Los trabajadores deben ser una lista' })
  @ArrayMinSize(1, { message: 'El equipo debe tener al menos un trabajador' })
  @IsUUID('4', { each: true, message: 'Cada trabajador debe tener un UUID válido' })
  uuidTrabajadores!: string[];
}