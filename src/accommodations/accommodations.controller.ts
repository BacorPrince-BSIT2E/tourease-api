import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccommodationQueryDto } from './dto/accommodation-query.dto';
import { CreateAccommodationDto } from './dto/create-accommodation.dto';
import { UpdateAccommodationDto } from './dto/update-accommodation.dto';
import { AccommodationsService } from './accommodations.service';

// Exposes public accommodation browsing and role-protected management endpoints.
@Controller('accommodations')
export class AccommodationsController {
  constructor(private readonly accommodations: AccommodationsService) {}

  @Public()
  @Get()
  findAll(@Query() query: AccommodationQueryDto) {
    return this.accommodations.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) accommodationId: number) {
    return this.accommodations.findOne(accommodationId);
  }

  @Roles('Staff', 'Admin')
  @Post()
  create(@Body() dto: CreateAccommodationDto) {
    return this.accommodations.create(dto);
  }

  @Roles('Staff', 'Admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) accommodationId: number,
    @Body() dto: UpdateAccommodationDto,
  ) {
    return this.accommodations.update(accommodationId, dto);
  }

  @Roles('Admin')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) accommodationId: number) {
    return this.accommodations.remove(accommodationId);
  }
}
