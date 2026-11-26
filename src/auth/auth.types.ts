import { User } from '../entities/user.entity';

// Describes the identity and role stored in a signed access token.
export interface JwtPayload {
  sub: number;
  role: User['userRole'];
}
