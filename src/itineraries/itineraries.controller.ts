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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItineraryQueryDto } from './dto/itinerary-query.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { ItinerariesService } from './itineraries.service';

type AuthenticatedRequest = Request & { user: JwtPayload };

// Exposes authenticated itinerary CRUD routes using the JWT identity.
@Controller('itineraries')
export class ItinerariesController {
  constructor(private readonly itineraries: ItinerariesService) {}

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query() query: ItineraryQueryDto,
  ) {
    return this.itineraries.findAll(request.user.sub, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) itineraryId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itineraries.findOne(itineraryId, request.user);
  }

  @Post()
  create(
    @Body() dto: CreateItineraryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itineraries.create(request.user.sub, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) itineraryId: number,
    @Body() dto: UpdateItineraryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itineraries.update(itineraryId, request.user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('id', ParseIntPipe) itineraryId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itineraries.remove(itineraryId, request.user);
  }
}
