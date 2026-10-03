import { Module } from '@nestjs/common';
import { CotizacionService } from './cotizacion.service';
import { CotizacionController } from './cotizacion.controller';
import { Cotizacion } from './entities/cotizacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { Material } from 'src/material/entities/material.entity';
import { DetalleCotizacion } from './entities/detalle-cotizacion.entity';
import { PdfModule } from 'src/pdf/pdf.module';
import { ProyectoModule } from 'src/proyecto/proyecto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cotizacion, Proyecto, Material, DetalleCotizacion]),
    PdfModule,
    ProyectoModule,
  ],
  controllers: [CotizacionController],
  providers: [CotizacionService],
})
export class CotizacionModule {}
