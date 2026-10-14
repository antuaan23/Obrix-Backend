import { Injectable } from "@nestjs/common";
import { MailTemplate } from "./mail-template.enum";
import { TemplateContextMap } from "./interfaces/contexto-mail.interface";

@Injectable()
export class MailTemplateService{
    // 1. SOBRECARGAS (Definen qué contexto exige estrictamente cada plantilla)
    render(plantilla: MailTemplate.BIENVENIDO, contexto: TemplateContextMap[MailTemplate.BIENVENIDO]): string;
    render(plantilla: MailTemplate.COTIZACION_ENVIADA, contexto: TemplateContextMap[MailTemplate.COTIZACION_ENVIADA]): string;
    render(plantilla: MailTemplate.PRESUPUESTO_CREADO, contexto: TemplateContextMap[MailTemplate.PRESUPUESTO_CREADO]): string;
    render(plantilla: MailTemplate.GASTO_CREADO, contexto: TemplateContextMap[MailTemplate.GASTO_CREADO]): string;
    render(plantilla: MailTemplate.COTIZACION_CREADA, contexto: TemplateContextMap[MailTemplate.COTIZACION_CREADA]): string;
    render(plantilla: MailTemplate, contexto: any): string;

    // 2. IMPLEMENTACIÓN REAL (Única y centralizada)
    render(plantilla: MailTemplate, contexto: any): string {
    switch (plantilla) {
        case MailTemplate.BIENVENIDO: {
        const ctx = contexto as TemplateContextMap[MailTemplate.BIENVENIDO];
        return `<h1>¡Bienvenido, ${ctx.nombreUsuario}! <p>Gracias por registrarte.</p></h1>`;
        }

        case MailTemplate.COTIZACION_ENVIADA: {
        const ctx = contexto as TemplateContextMap[MailTemplate.COTIZACION_ENVIADA];
        return `<h1>¡${ctx.nombreUsuario}, tu cotización ${ctx.folioCotizacion} ha sido enviada exitosamente! <p>:)</p></h1>`;
        }

        case MailTemplate.PRESUPUESTO_CREADO: {
        const ctx = contexto as TemplateContextMap[MailTemplate.PRESUPUESTO_CREADO];
        return `<p>Te notificamos que se ha fijado un presupuesto para el proyecto ${ctx.nombreProyecto} de ${ctx.monto}</p>`;
        }

        case MailTemplate.GASTO_CREADO: {
        const ctx = contexto as TemplateContextMap[MailTemplate.GASTO_CREADO];
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Obrix - Nuevo Gasto Registrado</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <!-- Contenedor principal -->
                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                            
                            <!-- Cabecera -->
                            <tr>
                                <td style="background-color: #2563eb; padding: 40px 20px; text-align: center; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 0.5px;">
                                    Obrix
                                </td>
                            </tr>

                            <!-- Cuerpo del mensaje -->
                            <tr>
                                <td style="padding: 40px;">
                                    
                                    <!-- Badge de Gasto Creado -->
                                    <div style="text-align: center; margin-bottom: 25px;">
                                        <span style="background-color: #eff6ff; color: #1d4ed8; padding: 8px 18px; border-radius: 999px; font-weight: bold; font-size: 14px; display: inline-block; border: 1px solid #bfdbfe;">
                                            💸 NUEVO GASTO REGISTRADO
                                        </span>
                                    </div>

                                    <!-- Saludo y título -->
                                    <div style="text-align: center; margin-bottom: 10px;">
                                        <p style="margin: 0 0 10px 0; color: #52525b; font-size: 16px;">
                                            Hola, <span style="font-weight: bold; color: #18181b;">${ctx.nombreUsuario}</span> 👷‍♂️
                                        </p>
                                        <h1 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px; font-weight: bold; line-height: 1.4;">
                                            Se ha añadido un nuevo gasto al sistema
                                        </h1>
                                        <p style="margin: 0 0 30px 0; color: #52525b; font-size: 15px; line-height: 1.5;">
                                            Te informamos que se ha registrado exitosamente una nueva transacción asociada a tu proyecto <span style="font-weight: bold; color: #18181b;">${ctx.nombreProyecto}</span>.
                                        </p>
                                    </div>

                                    <!-- Tarjeta de datos estructurada -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-left: 6px solid #2563eb; border-radius: 8px; border: 1px solid #e2e8f0;">
                                        <tr>
                                            <td style="padding: 24px;">

                                                <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">
                                                    📋 GASTO
                                                </div>
                                                <div style="margin-top: 4px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                    ${ctx.nombreGasto}
                                                </div>

                                                <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">

                                                <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">
                                                    🪙 MONTO DEL GASTO
                                                </div>
                                                <div style="margin-top: 4px; font-size: 18px; font-weight: bold; color: #2563eb;">
                                                    ${ctx.monto}
                                                </div>

                                                <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">

                                                <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">
                                                    📅 FECHA CREACIÓN
                                                </div>
                                                <div style="margin-top: 4px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                    ${ctx.fechaCreacion}
                                                </div>

                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Alerta y Aviso de Seguridad -->
                                    <table width="100%" style="margin-top: 35px; background-color: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa;">
                                        <tr>
                                            <td style="padding: 20px; font-size: 14px; color: #9a3412; line-height: 1.7;">
                                                💡 <strong>Información importante</strong>
                                                <br>
                                                Puedes revisar el detalle completo de este registro ingresando directamente a la plataforma Obrix. (El comprobante va adjunto en este correo).
                                                <br><br>
                                                🛡️ <strong>Aviso de seguridad</strong>
                                                <br>
                                                Obrix nunca solicitará contraseñas, datos bancarios ni información personal por correo electrónico. Si recibes un mensaje sospechoso, repórtalo al administrador.
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Pie de página -->
                            <tr>
                                <td style="background-color: #0f172a; padding: 30px 20px; text-align: center; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                                    <div style="font-weight: bold; color: #ffffff; font-size: 15px; margin-bottom: 4px;">Obrix</div>
                                    Sistema de gestión de obras y proyectos.
                                    <br><br>
                                    Este es un correo generado automáticamente. Por favor, no respondas a este mensaje.
                                    <br><br>
                                    <span style="font-size: 12px; color: #64748b;">© 2026 Obrix · Todos los derechos reservados</span>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`;
      }

        case MailTemplate.COTIZACION_CREADA: {
        const ctx = contexto as TemplateContextMap[MailTemplate.COTIZACION_CREADA];
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Obrix - Nuevo Gasto Registrado</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <!-- Contenedor principal -->
                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                            
                            <!-- Cabecera -->
                            <tr>
                                <td style="background-color: #2563eb; padding: 40px 20px; text-align: center; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 0.5px;">
                                    Obrix
                                </td>
                            </tr>

                            <!-- Cuerpo del mensaje -->
                            <tr>
                                <td style="padding: 40px;">
                                    
                                    <!-- Badge de Gasto Creado -->
                                    <div style="text-align: center; margin-bottom: 25px;">
                                        <span style="background-color: #eff6ff; color: #1d4ed8; padding: 8px 18px; border-radius: 999px; font-weight: bold; font-size: 14px; display: inline-block; border: 1px solid #bfdbfe;">
                                            💸 NUEVA COTIZACIÓN INGRESADA
                                        </span>
                                    </div>

                                    <!-- Saludo y título -->
                                    <div style="text-align: center; margin-bottom: 10px;">
                                        <p style="margin: 0 0 10px 0; color: #52525b; font-size: 16px;">
                                            Hola, <span style="font-weight: bold; color: #18181b;">${ctx.usuarioLider}</span> 👷‍♂️
                                        </p>
                                        <h1 style="margin: 0 0 20px 0; color: #1e293b; font-size: 22px; font-weight: bold; line-height: 1.4;">
                                            Se ha ingresado una nueva cotización.
                                        </h1>
                                        <p style="margin: 0 0 30px 0; color: #52525b; font-size: 15px; line-height: 1.5;">
                                            Te informamos que se hay una cotización pendiente de revision asociada al proyecto <span style="font-weight: bold; color: #18181b;">${ctx.nombreProyecto}</span>.
                                        </p>
                                    </div>

                                    <!-- Tarjeta de datos estructurada -->
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-left: 6px solid #2563eb; border-radius: 8px; border: 1px solid #e2e8f0;">
                                        <tr>
                                            <td style="padding: 24px;">

                                                <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">
                                                    📑 COTIZACION
                                                </div>
                                                <div style="margin-top: 4px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                    ${ctx.nombreCotizacion}
                                                </div>

                                                <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">
                                                <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">
                                                    📋 N° FOLIO
                                                </div>
                                                <div style="margin-top: 4px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                    ${ctx.folioCotizacion}
                                                </div>

                                                <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">

                                                <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">
                                                    🪙 MONTO DEL GASTO
                                                </div>
                                                <div style="margin-top: 4px; font-size: 18px; font-weight: bold; color: #2563eb;">
                                                    ${ctx.montoCotizacion}
                                                </div>

                                                <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">

                                                <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">
                                                    📅 FECHA CREACIÓN
                                                </div>
                                                <div style="margin-top: 4px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                    ${ctx.fechaCreacion}
                                                </div>

                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Alerta y Aviso de Seguridad -->
                                    <table width="100%" style="margin-top: 35px; background-color: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa;">
                                        <tr>
                                            <td style="padding: 20px; font-size: 14px; color: #9a3412; line-height: 1.7;">
                                                💡 <strong>Información importante</strong>
                                                <br>
                                                Puedes revisar el detalle completo de este registro ingresando directamente a la plataforma Obrix. (El comprobante va adjunto en este correo).
                                                <br><br>
                                                🛡️ <strong>Aviso de seguridad</strong>
                                                <br>
                                                Obrix nunca solicitará contraseñas, datos bancarios ni información personal por correo electrónico. Si recibes un mensaje sospechoso, repórtalo al administrador.
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Pie de página -->
                            <tr>
                                <td style="background-color: #0f172a; padding: 30px 20px; text-align: center; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                                    <div style="font-weight: bold; color: #ffffff; font-size: 15px; margin-bottom: 4px;">Obrix</div>
                                    Sistema de gestión de obras y proyectos.
                                    <br><br>
                                    Este es un correo generado automáticamente. Por favor, no respondas a este mensaje.
                                    <br><br>
                                    <span style="font-size: 12px; color: #64748b;">© 2026 Obrix · Todos los derechos reservados</span>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`;
      }

        default:
        throw new Error(`Plantilla ${plantilla} no encontrada.`);
    }
    }
}