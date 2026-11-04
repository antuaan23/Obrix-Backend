import { Injectable } from "@nestjs/common";
import { MailTemplate } from "./mail-template.enum";
import { TemplateContextMap } from "./interfaces/contexto-mail.interface";

@Injectable()
export class MailTemplateService {
  // 1. SOBRECARGAS
  render(plantilla: MailTemplate.BIENVENIDO, contexto: TemplateContextMap[MailTemplate.BIENVENIDO]): string;
  render(plantilla: MailTemplate.COTIZACION_ENVIADA, contexto: TemplateContextMap[MailTemplate.COTIZACION_ENVIADA]): string;
  render(plantilla: MailTemplate.PRESUPUESTO_CREADO, contexto: TemplateContextMap[MailTemplate.PRESUPUESTO_CREADO]): string;
  render(plantilla: MailTemplate.GASTO_CREADO, contexto: TemplateContextMap[MailTemplate.GASTO_CREADO]): string;
  render(plantilla: MailTemplate.COTIZACION_CREADA, contexto: TemplateContextMap[MailTemplate.COTIZACION_CREADA]): string;
  render(plantilla: MailTemplate.RESESTABLECER_PASS, contexto: TemplateContextMap[MailTemplate.RESESTABLECER_PASS]): string;
  render(plantilla: MailTemplate, contexto: any): string;

  // 2. IMPLEMENTACIÓN REAL
  render(plantilla: MailTemplate, contexto: any): string {
    switch (plantilla) {
      case MailTemplate.BIENVENIDO: {
        const ctx = contexto as TemplateContextMap[MailTemplate.BIENVENIDO];
        return this.generarPlantillaBase({
          tituloPagina: "Bienvenido a Obrix",
          badgeTexto: "🚀 BIENVENIDO A OBRIX",
          badgeColor: "#FF3B30",
          saludo: `Hola, <span style="font-weight: 700; color: #18181B;">${ctx.nombreUsuario}</span> 👋`,
          tituloPrincipal: "¡Tu cuenta ha sido creada exitosamente!",
          descripcion:
            "Te damos la bienvenida a <strong>Obrix</strong>, la plataforma para gestionar tus obras, presupuestos, cotizaciones, trabajadores y gastos en un solo lugar con total control.",
          contenidoHtml: `
            <div style="background-color: #FAFAFA; border: 1px solid #E4E4E7; border-left: 4px solid #FF3B30; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #18181B;">¿Qué puedes hacer en Obrix?</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #52525B; line-height: 1.8;">
                <li>Gestionar proyectos y controlar presupuestos en tiempo real.</li>
                <li>Generar y enviar cotizaciones con PDFs profesionales.</li>
                <li>Registrar gastos con fotos de boletas y comprobantes.</li>
                <li>Llevar la bitácora diaria y avances de tu equipo.</li>
              </ul>
            </div>
          `,
        });
      }

      case MailTemplate.RESESTABLECER_PASS: {
        const ctx = contexto as TemplateContextMap[MailTemplate.RESESTABLECER_PASS];
        return this.generarPlantillaBase({
          tituloPagina: "Recuperación de Contraseña - Obrix",
          badgeTexto: "🔐 RECUPERACIÓN DE CONTRASEÑA",
          badgeColor: "#FF3B30",
          saludo: `Hola, <span style="font-weight: 700; color: #18181B;">${ctx.nombre}</span>`,
          tituloPrincipal: "Solicitud para restablecer tu clave",
          descripcion:
            "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Obrix</strong>. Utiliza el siguiente código de verificación de 6 dígitos:",
          contenidoHtml: `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAFA; border-radius: 10px; border: 1px solid #E4E4E7; text-align: center; margin: 25px 0;">
              <tr>
                <td style="padding: 28px 20px;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; letter-spacing: 1.5px;">
                    CÓDIGO DE VERIFICACIÓN
                  </div>
                  <div style="margin-top: 12px; font-size: 36px; font-weight: 800; color: #FF3B30; letter-spacing: 8px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;">
                    ${ctx.codigo}
                  </div>
                  <div style="margin-top: 12px; font-size: 13px; color: #71717A;">
                    ⏳ Este código expirará en <strong>15 minutos</strong>.
                  </div>
                </td>
              </tr>
            </table>
          `,
          avisoSeguridad:
            "Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje con tranquilidad. Tu clave actual sigue protegida.",
        });
      }

      case MailTemplate.GASTO_CREADO: {
        const ctx = contexto as TemplateContextMap[MailTemplate.GASTO_CREADO];
        const montoFormateado = this.formatearClp(ctx.monto);
        return this.generarPlantillaBase({
          tituloPagina: "Nuevo Gasto Registrado - Obrix",
          badgeTexto: "💸 NUEVO GASTO REGISTRADO",
          badgeColor: "#FF3B30",
          saludo: `Hola, <span style="font-weight: 700; color: #18181B;">${ctx.nombreUsuario}</span> 👷‍♂️`,
          tituloPrincipal: "Se ha añadido un nuevo gasto al proyecto",
          descripcion: `Se ha registrado exitosamente una nueva transacción asociada al proyecto <strong style="color: #18181B;">${ctx.nombreProyecto}</strong>.`,
          contenidoHtml: `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAFA; border-left: 4px solid #FF3B30; border-radius: 8px; border-top: 1px solid #E4E4E7; border-right: 1px solid #E4E4E7; border-bottom: 1px solid #E4E4E7; margin: 25px 0;">
              <tr>
                <td style="padding: 22px;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; letter-spacing: 1px;">
                    📋 GASTO
                  </div>
                  <div style="margin-top: 4px; font-size: 16px; font-weight: 700; color: #18181B;">
                    ${ctx.nombreGasto}
                  </div>

                  <hr style="margin: 14px 0; border: none; border-top: 1px solid #E4E4E7;">

                  <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; letter-spacing: 1px;">
                    🪙 MONTO DEL GASTO
                  </div>
                  <div style="margin-top: 4px; font-size: 22px; font-weight: 800; color: #FF3B30;">
                    ${montoFormateado}
                  </div>

                  <hr style="margin: 14px 0; border: none; border-top: 1px solid #E4E4E7;">

                  <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; letter-spacing: 1px;">
                    📅 FECHA DE REGISTRO
                  </div>
                  <div style="margin-top: 4px; font-size: 14px; font-weight: 600; color: #3F3F46;">
                    ${ctx.fechaCreacion}
                  </div>
                </td>
              </tr>
            </table>
          `,
          avisoSeguridad:
            "Puedes revisar el comprobante adjunto y el historial de gastos directamente en el panel de tu proyecto en Obrix.",
        });
      }

      case MailTemplate.COTIZACION_CREADA: {
        const ctx = contexto as TemplateContextMap[MailTemplate.COTIZACION_CREADA];
        const montoFormateado = this.formatearClp(ctx.montoCotizacion);
        const fechaStr = ctx.fechaCreacion ? new Date(ctx.fechaCreacion).toLocaleDateString("es-CL") : "";
        return this.generarPlantillaBase({
          tituloPagina: "Nueva Cotización - Obrix",
          badgeTexto: "📑 NUEVA COTIZACIÓN INGRESADA",
          badgeColor: "#FF3B30",
          saludo: `Hola, <span style="font-weight: 700; color: #18181B;">${ctx.usuarioLider}</span> 👷‍♂️`,
          tituloPrincipal: "Se ha ingresado una nueva cotización",
          descripcion: `Se ha registrado una nueva cotización pendiente de revisión para el proyecto <strong style="color: #18181B;">${ctx.nombreProyecto}</strong>.`,
          contenidoHtml: `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAFA; border-left: 4px solid #FF3B30; border-radius: 8px; border-top: 1px solid #E4E4E7; border-right: 1px solid #E4E4E7; border-bottom: 1px solid #E4E4E7; margin: 25px 0;">
              <tr>
                <td style="padding: 22px;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; letter-spacing: 1px;">
                    📑 COTIZACIÓN
                  </div>
                  <div style="margin-top: 4px; font-size: 16px; font-weight: 700; color: #18181B;">
                    ${ctx.nombreCotizacion}
                  </div>

                  <hr style="margin: 14px 0; border: none; border-top: 1px solid #E4E4E7;">

                  <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; letter-spacing: 1px;">
                    📋 N° FOLIO
                  </div>
                  <div style="margin-top: 4px; font-size: 15px; font-weight: 600; color: #18181B;">
                    #${ctx.folioCotizacion}
                  </div>

                  <hr style="margin: 14px 0; border: none; border-top: 1px solid #E4E4E7;">

                  <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; letter-spacing: 1px;">
                    🪙 MONTO TOTAL
                  </div>
                  <div style="margin-top: 4px; font-size: 22px; font-weight: 800; color: #FF3B30;">
                    ${montoFormateado}
                  </div>

                  ${fechaStr ? `
                  <hr style="margin: 14px 0; border: none; border-top: 1px solid #E4E4E7;">
                  <div style="font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; letter-spacing: 1px;">
                    📅 FECHA CREACIÓN
                  </div>
                  <div style="margin-top: 4px; font-size: 14px; font-weight: 600; color: #3F3F46;">
                    ${fechaStr}
                  </div>
                  ` : ""}
                </td>
              </tr>
            </table>
          `,
          avisoSeguridad:
            "Puedes descargar el PDF y recalcular el presupuesto del proyecto desde el módulo de Cotizaciones en Obrix.",
        });
      }

      case MailTemplate.COTIZACION_ENVIADA: {
        const ctx = contexto as TemplateContextMap[MailTemplate.COTIZACION_ENVIADA];
        return this.generarPlantillaBase({
          tituloPagina: "Cotización Enviada - Obrix",
          badgeTexto: "📤 COTIZACIÓN ENVIADA",
          badgeColor: "#FF3B30",
          saludo: `Hola, <span style="font-weight: 700; color: #18181B;">${ctx.nombreUsuario}</span>`,
          tituloPrincipal: "Tu cotización fue enviada exitosamente",
          descripcion: `Te confirmamos que la cotización con <strong>Folio #${ctx.folioCotizacion}</strong> ha sido enviada al cliente.`,
        });
      }

      case MailTemplate.PRESUPUESTO_CREADO: {
        const ctx = contexto as TemplateContextMap[MailTemplate.PRESUPUESTO_CREADO];
        return this.generarPlantillaBase({
          tituloPagina: "Presupuesto Asignado - Obrix",
          badgeTexto: "💰 PRESUPUESTO ASIGNADO",
          badgeColor: "#FF3B30",
          tituloPrincipal: "Nuevo presupuesto establecido",
          descripcion: `Se ha fijado un presupuesto para el proyecto <strong style="color: #18181B;">${ctx.nombreProyecto}</strong> por un monto de <strong style="color: #FF3B30; font-size: 18px;">${ctx.monto}</strong>.`,
        });
      }

      default:
        throw new Error(`Plantilla ${plantilla} no encontrada.`);
    }
  }

  /**
   * Layout maestro HTML responsivo con la identidad visual corporativa de OBRIX:
   * Header grafito oscuro (#121214) + Logo rojo vibrante (#FF3B30) + Tarjeta limpia
   */
  private generarPlantillaBase(params: {
    tituloPagina: string;
    badgeTexto: string;
    badgeColor?: string;
    saludo?: string;
    tituloPrincipal: string;
    descripcion: string;
    contenidoHtml?: string;
    avisoSeguridad?: string;
  }): string {
    const colorPrimario = params.badgeColor || "#FF3B30";

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.tituloPagina}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F0F12; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal (Max 600px) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
          
          <!-- Cabecera Corporativa OBRIX (Grafito oscuro #18181B con logo rojo #FF3B30) -->
          <tr>
            <td style="background-color: #18181B; padding: 35px 20px; text-align: center; border-bottom: 2px solid #27272A;">
              <div style="display: inline-block;">
                <span style="color: #FF3B30; font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  OBRIX
                </span>
                <div style="color: #A1A1AA; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-top: 4px;">
                  Plataforma de Gestión de Obras
                </div>
              </div>
            </td>
          </tr>

          <!-- Contenido del Correo -->
          <tr>
            <td style="padding: 35px 30px;">
              
              <!-- Badge de Tipo de Notificación con colores OBRIX -->
              <div style="text-align: center; margin-bottom: 22px;">
                <span style="background-color: #FEF2F2; color: ${colorPrimario}; padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 12px; letter-spacing: 0.5px; display: inline-block; border: 1px solid #FECDD3;">
                  ${params.badgeTexto}
                </span>
              </div>

              <!-- Saludo y Títulos -->
              <div style="text-align: center; margin-bottom: 10px;">
                ${params.saludo ? `<p style="margin: 0 0 12px 0; color: #71717A; font-size: 15px;">${params.saludo}</p>` : ""}
                <h1 style="margin: 0 0 16px 0; color: #18181B; font-size: 22px; font-weight: 800; line-height: 1.35;">
                  ${params.tituloPrincipal}
                </h1>
                <p style="margin: 0 0 10px 0; color: #52525B; font-size: 15px; line-height: 1.6;">
                  ${params.descripcion}
                </p>
              </div>

              <!-- Contenido Específico / Tablas -->
              ${params.contenidoHtml || ""}

              <!-- Bloque de Seguridad / Aviso -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px; background-color: #FAFAFA; border-radius: 8px; border: 1px solid #E4E4E7;">
                <tr>
                  <td style="padding: 16px 18px; font-size: 13px; color: #71717A; line-height: 1.6;">
                    🛡️ <strong>Seguridad Obrix:</strong> ${params.avisoSeguridad || "Obrix nunca te solicitará tu contraseña ni transferencias bancarias por correo electrónico."}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Pie de página (Dark) -->
          <tr>
            <td style="background-color: #121214; padding: 25px 20px; text-align: center; color: #71717A; font-size: 12px; line-height: 1.7; border-top: 1px solid #27272A;">
              <div style="font-weight: 800; color: #FFFFFF; font-size: 14px; margin-bottom: 3px; letter-spacing: 1px;">
                <span style="color: #FF3B30;">OBRIX</span>
              </div>
              <div>Sistema Inteligente de Gestión de Obras y Proyectos</div>
              <div style="margin-top: 10px; color: #52525B; font-size: 11px;">
                Este es un mensaje generado automáticamente. Por favor, no respondas a este correo.
                <br>© 2026 Obrix · Todos los derechos reservados.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private formatearClp(monto: number): string {
    if (monto === undefined || monto === null) return "$0";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(monto);
  }
}
