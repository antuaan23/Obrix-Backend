import { ConfigService } from '@nestjs/config';
import { Options, Environment, WebpayPlus, IntegrationCommerceCodes, IntegrationApiKeys } from 'transbank-sdk';

export const WEBPAY_PLUS_TRANSACTION = 'WEBPAY_PLUS_TRANSACTION';

export const webpayPlusProvider = {
  provide: WEBPAY_PLUS_TRANSACTION,
  useFactory: (configService: ConfigService) => {
    const nodeEnv = configService.get<string>('NODE_ENV');
    const isProduction = nodeEnv === 'production';

    const codigoComercio =
      configService.get<string>('WEBPAY_COMMERCE_CODE') ||
      configService.get<string>('WEBPAY_CODIGO_COMERCIO') ||
      IntegrationCommerceCodes.WEBPAY_PLUS;

    const claveApi =
      configService.get<string>('WEBPAY_API_KEY') ||
      configService.get<string>('WEBPAY_CLAVE_API') ||
      IntegrationApiKeys.WEBPAY;

    const ambiente = isProduction ? Environment.Production : Environment.Integration;

    const opciones = new Options(codigoComercio, claveApi, ambiente);

    return new WebpayPlus.Transaction(opciones);
  },
  inject: [ConfigService],
};
