import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

// Limits profile updates to a user's name and email address.
export class UpdateUserDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsEmail()
  @MaxLength(100)
  email?: string;
}
