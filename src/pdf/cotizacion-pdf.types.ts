export interface CotizacionPdfItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CotizacionPdfData {
  codigo: string;
  nombreCotizacion: string;
  proyectoNombre: string;
  clienteNombre: string;
  fecha: string;
  items: CotizacionPdfItem[];
  total: number;
}
