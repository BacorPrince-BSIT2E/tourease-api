import { SetMetadata } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { ROLES_KEY } from '../auth.constants';

// Restricts a route to users with one of the specified roles.
export const Roles = (...roles: User['userRole'][]) =>
  SetMetadata(ROLES_KEY, roles);
