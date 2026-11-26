import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

// Validates itinerary sorting and pagination query parameters.
export class ItineraryQueryDto {
  @IsOptional()
  @IsIn(['startDate'])
  sort?: 'startDate';

  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => (value === undefined ? 10 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}
