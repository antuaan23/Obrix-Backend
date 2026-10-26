import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secreto_super_seguro', 
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      uuid: payload.uuid, 
      email: payload.email, 
      nombre: payload.nombre, 
      ap_paterno: payload.ap_paterno 
    };
  }
}