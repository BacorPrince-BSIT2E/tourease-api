import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../auth.constants';

// Marks a route as accessible without a JWT.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
