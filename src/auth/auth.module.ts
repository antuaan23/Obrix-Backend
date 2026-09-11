import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TrabajadorModule } from '../trabajador/trabajador.module';
import { JwtModule } from '@nestjs/jwt';
import { Trabajador } from 'src/trabajador/entities/trabajador.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ 
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([Trabajador]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}