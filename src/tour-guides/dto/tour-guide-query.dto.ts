import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// Validates tour-guide filters and pagination query parameters.
export class TourGuideQueryDto {
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
  @IsString()
  specialization?: string;

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
