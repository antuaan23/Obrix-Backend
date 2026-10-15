import { IsNotEmpty, IsUUID } from 'class-validator';

export class AgregarUsuarioProyectoDto {
  @IsNotEmpty({ message: 'El UUID del usuario es obligatorio' })
  @IsUUID('4', { message: 'El UUID del usuario debe ser un UUID válido' })
  uuidUsuario!: string;
}