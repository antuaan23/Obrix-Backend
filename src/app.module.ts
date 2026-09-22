import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { ClienteModule } from './cliente/cliente.module';
import { GastoModule } from './gasto/gasto.module';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [
    // 1. Carga variables de entorno (.env) de forma global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Inicializa la conexión a PostgreSQL esperando a que el ConfigService esté listo
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        autoLoadEntities: true,
        synchronize: true, 
      }),
    }),
    AuthModule,
    ProyectoModule,
    ClienteModule,
    GastoModule,
    UsuarioModule,
  ],
})
export class AppModule {}