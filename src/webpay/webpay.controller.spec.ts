import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WebpayController } from './webpay.controller';
import { WebpayService } from './webpay.service';

describe('WebpayController', () => {
  let controller: WebpayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebpayController],
      providers: [
        {
          provide: WebpayService,
          useValue: {
            crearTransaccion: jest.fn(),
            confirmarTransaccion: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebpayController>(WebpayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
