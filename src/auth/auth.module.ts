import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { JwtModule } from '@nestjs/jwt';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ 
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([Usuario]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}