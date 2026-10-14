import { IsString, IsEmail, IsNotEmpty, IsEnum, IsObject, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MailTemplate } from "../mail-template.enum";
import { TemplateContextMap } from "../interfaces/contexto-mail.interface";

// Creamos la unión de todos los contextos posibles del mapa
export type MailContextUnion = TemplateContextMap[keyof TemplateContextMap];

export class SendMailDto {
    @ApiProperty({ example: 'ni.antugb@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    to!: string;

    @ApiProperty({ example: 'Obrix App <soporte@obrix.com>', required: false })
    @IsString() 
    @IsOptional()
    from?: string;

    @ApiProperty({ example: 'Bienvenido a la plataforma', required: false })
    @IsString()
    @IsOptional()
    subject?: string; // Añadido para controlar el asunto del correo dinámicamente

    @ApiProperty({ enum: MailTemplate, example: MailTemplate.BIENVENIDO })
    @IsEnum(MailTemplate)
    @IsNotEmpty()
    plantilla!: MailTemplate;

    @ApiProperty({ 
        example: { nombreUsuario: 'Juan Pérez' }, 
        required: false 
    } as any) // Casteo 'as any' recomendado por Swagger para tipos unión complejos
    @IsObject()
    @IsOptional()
    contexto?: MailContextUnion;
}