import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  Matches,
  Min,
} from 'class-validator';

// Validates the destination and visit details for a new itinerary stop.
export class CreateItineraryDestinationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationId: number;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  visitDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  visitOrder: number;
}
