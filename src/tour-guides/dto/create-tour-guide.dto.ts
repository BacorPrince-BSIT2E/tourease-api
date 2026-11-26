import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Validates all tour-guide fields accepted during creation.
export class CreateTourGuideDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  specialization: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationId: number;
}
