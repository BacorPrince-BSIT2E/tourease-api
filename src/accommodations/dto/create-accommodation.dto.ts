import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Validates all accommodation fields required for creation.
export class CreateAccommodationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  accommodationName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  contactNumber: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  pricePerNight: number;
}
