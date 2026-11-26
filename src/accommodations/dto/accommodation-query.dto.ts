import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

// Validates accommodation filters and pagination query parameters.
export class AccommodationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined
      ? undefined
      : String(value).trim() === ''
        ? Number.NaN
        : Number(value),
  )
  @IsInt()
  @Min(1)
  destinationId?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined
      ? undefined
      : String(value).trim() === ''
        ? Number.NaN
        : Number(value),
  )
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn(['pricePerNight'])
  sort?: 'pricePerNight';

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
