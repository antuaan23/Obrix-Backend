import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolEnum } from 'src/rol/rol.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(RolEnum | string)[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado.');
    }

    const hasRole = requiredRoles.some((requiredRole) => {
      // Comparar por ID numérico (ej: RolEnum.ADMIN = 1)
      if (typeof requiredRole === 'number') {
        if (user.rolId && Number(user.rolId) === requiredRole) {
          return true;
        }
        const enumKey = RolEnum[requiredRole];
        if (enumKey && user.rol && user.rol.trim().toUpperCase() === enumKey.toUpperCase()) {
          return true;
        }
      }

      // Comparar por nombre de rol en string ('ADMIN', 'LIDER', etc.)
      if (typeof requiredRole === 'string' && user.rol) {
        return user.rol.trim().toUpperCase() === requiredRole.trim().toUpperCase();
      }

      return false;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para realizar esta acción.',
      );
    }

    return true;
  }
}

