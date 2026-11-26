import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Validates public registration data and enforces a minimum password length.
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
