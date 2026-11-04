import { SetMetadata } from '@nestjs/common';
import { RolEnum } from 'src/rol/rol.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RolEnum[]) => SetMetadata(ROLES_KEY, roles);