import { IsEmail, IsString, MinLength } from 'class-validator';

// Validates the email and password supplied to the login endpoint.
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
