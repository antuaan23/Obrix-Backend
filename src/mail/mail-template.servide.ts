import { Injectable } from "@nestjs/common";
import { MailTemplate } from "./mail-template.enum";

@Injectable()
export class MailTemplateService{
    render(plantilla: MailTemplate, contexto: Record<string, any>): string {
        switch (plantilla){
            case MailTemplate.BIENVENIDO:
                return `<h1>¡Bienvenido, ${contexto.nombre}! <p>Gracias por registrarte.</p></h1>`;

            case MailTemplate.COTIZACION_ENVIADA:
                return `<h1>¡${contexto.nombre}, tu cotización ha sido enviada exitosamente! <p>:)</p></h1>`;

            default:
                throw new Error(`Plantilla ${plantilla} no encontrada.`)
        }
    }
}