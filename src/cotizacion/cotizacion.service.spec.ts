import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CotizacionService } from './cotizacion.service';
import { Cotizacion } from './entities/cotizacion.entity';
import { Proyecto } from '../proyecto/entities/proyecto.entity';
import { Material } from '../material/entities/material.entity';
import { PdfService } from '../pdf/pdf.service';
import { ProyectoService } from '../proyecto/proyecto.service';

describe('CotizacionService', () => {
  let service: CotizacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CotizacionService,
        { provide: getRepositoryToken(Cotizacion), useValue: {} },
        { provide: getRepositoryToken(Proyecto), useValue: {} },
        { provide: getRepositoryToken(Material), useValue: {} },
        { provide: PdfService, useValue: { generatePdf: jest.fn() } },
        { provide: ProyectoService, useValue: { calcularYActualizarPresupuesto: jest.fn() } },
      ],
    }).compile();

    service = module.get<CotizacionService>(CotizacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
