import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

// Authenticates users and issues signed access tokens.
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailForAuthentication(
      loginDto.email,
    );

    if (!user || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.userId,
        role: user.userRole,
      }),
      tokenType: 'Bearer' as const,
      expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_IN'),
    };
  }
}
