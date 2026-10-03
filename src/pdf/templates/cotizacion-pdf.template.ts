/**
 * Plantilla HTML de una cotización individual.
 * Se compila con Handlebars: el helper `clp` formatea montos en pesos chilenos.
 */
export const COTIZACION_PDF_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        color: #1e293b;
        margin: 0;
        padding: 8px;
        font-size: 13px;
      }
      .brand { font-size: 22px; font-weight: bold; color: #0f172a; letter-spacing: 1px; }
      .subtitle { color: #64748b; margin-top: 4px; }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 3px solid #0284c7;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }
      .meta p { margin: 4px 0; }
      .meta strong { color: #0f172a; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #cbd5e1; padding: 10px 12px; }
      th { background: #f1f5f9; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.4px; }
      td.num, th.num { text-align: right; }
      tbody tr:nth-child(even) { background: #f8fafc; }
      .totals {
        margin-top: 24px;
        margin-left: auto;
        width: 280px;
      }
      .totals .row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
      }
      .totals .grand {
        border-top: 2px solid #0284c7;
        font-size: 16px;
        font-weight: bold;
        color: #0284c7;
        padding-top: 10px;
      }
      .footer {
        margin-top: 48px;
        font-size: 11px;
        color: #94a3b8;
        border-top: 1px solid #e2e8f0;
        padding-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="brand">OBRIX</div>
        <div class="subtitle">Cotización de obra</div>
      </div>
      <div class="meta">
        <p><strong>Documento:</strong> {{codigo}}</p>
        <p><strong>Fecha:</strong> {{fecha}}</p>
      </div>
    </div>

    <div class="meta">
      <p><strong>Cotización:</strong> {{nombreCotizacion}}</p>
      <p><strong>Proyecto:</strong> {{proyectoNombre}}</p>
      <p><strong>Cliente:</strong> {{clienteNombre}}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Descripción / Material</th>
          <th class="num">Cant.</th>
          <th class="num">P. unitario</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
          <tr>
            <td>{{this.name}}</td>
            <td class="num">{{this.quantity}}</td>
            <td class="num">{{clp this.unitPrice}}</td>
            <td class="num">{{clp this.total}}</td>
          </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="totals">
      <div class="row grand">
        <span>Total</span>
        <span>{{clp total}}</span>
      </div>
    </div>

    <div class="footer">
      Documento generado automáticamente por Obrix. Montos expresados en pesos chilenos (CLP).
    </div>
  </body>
</html>
`;
