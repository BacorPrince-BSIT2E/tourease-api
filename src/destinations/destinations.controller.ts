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
  Put,
  Query,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { DestinationQueryDto } from './dto/destination-query.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { DestinationsService } from './destinations.service';

// Exposes public destination browsing and role-protected management endpoints.
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinations: DestinationsService) {}

  @Public()
  @Get()
  findAll(@Query() query: DestinationQueryDto) {
    return this.destinations.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) destinationId: number) {
    return this.destinations.findOne(destinationId);
  }

  @Roles('Staff', 'Admin')
  @Post()
  create(@Body() dto: CreateDestinationDto) {
    return this.destinations.create(dto);
  }

  @Roles('Staff', 'Admin')
  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) destinationId: number,
    @Body() dto: CreateDestinationDto,
  ) {
    return this.destinations.replace(destinationId, dto);
  }

  @Roles('Staff', 'Admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) destinationId: number,
    @Body() dto: UpdateDestinationDto,
  ) {
    return this.destinations.update(destinationId, dto);
  }

  @Roles('Admin')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) destinationId: number) {
    return this.destinations.remove(destinationId);
  }
}
