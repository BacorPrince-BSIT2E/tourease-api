import {
  IsDateString,
  IsInt,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

// Validates the optional visit date and order accepted by PATCH.
export class UpdateItineraryDestinationDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  visitDate?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  visitOrder?: number;
}
