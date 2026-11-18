import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebpayService } from './webpay.service';
import { WebpayController } from './webpay.controller';
import { webpayPlusProvider } from './webpay.provider';
import { PagoWebpay } from './entities/pago-webpay.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { SuscripcionModule } from 'src/suscripcion/suscripcion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PagoWebpay, Plan, Usuario]),
    SuscripcionModule,
  ],
  controllers: [WebpayController],
  providers: [WebpayService, webpayPlusProvider],
  exports: [WebpayService, webpayPlusProvider, TypeOrmModule],
})
export class WebpayModule {}
