import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 💡 Cambiado a minúsculas para que coincida con AuthModule (o lea del .env)
      secretOrKey: process.env.JWT_SECRET || 'secreto_super_seguro', 
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