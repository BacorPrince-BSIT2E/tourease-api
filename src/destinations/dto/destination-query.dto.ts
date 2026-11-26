import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

// Validates destination search filters and pagination query parameters.
export class DestinationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

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
  maxFee?: number;

  @IsOptional()
  @IsIn(['destinationName', 'entranceFee'])
  sort?: 'destinationName' | 'entranceFee';

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
