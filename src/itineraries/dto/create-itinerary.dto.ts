import { IsDateString, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// Validates the itinerary fields supplied when creating a plan.
export class CreateItineraryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  itineraryName: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate: string;
}
