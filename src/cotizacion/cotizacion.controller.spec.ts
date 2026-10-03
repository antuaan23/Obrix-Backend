import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionController } from './cotizacion.controller';
import { CotizacionService } from './cotizacion.service';

describe('CotizacionController', () => {
  let controller: CotizacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CotizacionController],
      providers: [
        {
          provide: CotizacionService,
          useValue: {
            crearCotizacion: jest.fn(),
            obtenerPorProyectoUuid: jest.fn(),
            generarPdfPorUuid: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CotizacionController>(CotizacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
