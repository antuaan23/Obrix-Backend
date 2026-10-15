import { MailTemplate } from '../mail-template.enum';

export interface BienvenidaContexto{
    nombreUsuario: string;
}

export interface ResetearPassContexto{
  nombre: string;
  codigo: string;
}

export interface CotizacionEnviadaContexto{
    nombreUsuario: string;
    nombreProyecto: string;
    folioCotizacion: string;
    nombreCotizacion: string;
    montoCotización: number;
    fechaCreacion: Date
}

export interface CotizacionCreadaContexto{
    usuarioLider: string;
    nombreProyecto: string;
    folioCotizacion: number;
}

export interface PresupuestoCreadoContexto{
    nombreUsuario: string;
    nombreProyecto: string;
    monto: number;
}

export interface GastoCreadoContexto{
    nombreUsuario: string;
    nombreProyecto: string;
    monto: number;
    nombreGasto: string;
    fechaCreacion: string;
}

// Definimos qué interfaz le pertenece a cada enum
export type TemplateContextMap = {
  [MailTemplate.BIENVENIDO]: { nombreUsuario: string };
  [MailTemplate.COTIZACION_ENVIADA]: { 
    nombreUsuario: string; 
    folioCotizacion: string
 };
  [MailTemplate.PRESUPUESTO_CREADO]: { 
    nombreProyecto: string; 
    monto: string 
};
  [MailTemplate.GASTO_CREADO]: { 
    nombreUsuario: string; 
    nombreProyecto: string; 
    monto: number; 
    nombreGasto: string; 
    fechaCreacion: string;  
};
  [MailTemplate.COTIZACION_CREADA]: { 
    folioCotizacion: number; 
    usuarioLider: string; 
    nombreProyecto: string; 
    nombreCotizacion: string; 
    montoCotizacion: number; 
    fechaCreacion: Date; 
};
  [MailTemplate.RESESTABLECER_PASS]: { 
    nombre: string;
    codigo: string;
};
}