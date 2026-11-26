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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { CreateItineraryDestinationDto } from './dto/create-itinerary-destination.dto';
import { UpdateItineraryDestinationDto } from './dto/update-itinerary-destination.dto';
import { ItineraryDestinationsService } from './itinerary-destinations.service';

type AuthenticatedRequest = Request & { user: JwtPayload };

// Exposes authenticated endpoints for a single itinerary's destination stops.
@Controller('itineraries/:id/destinations')
export class ItineraryDestinationsController {
  constructor(
    private readonly itineraryDestinations: ItineraryDestinationsService,
  ) {}

  @Get()
  findAll(
    @Param('id', ParseIntPipe) itineraryId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itineraryDestinations.findAll(itineraryId, request.user);
  }

  @Post()
  create(
    @Param('id', ParseIntPipe) itineraryId: number,
    @Body() dto: CreateItineraryDestinationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itineraryDestinations.create(
      itineraryId,
      request.user.sub,
      dto,
    );
  }

  @Patch(':entryId')
  update(
    @Param('id', ParseIntPipe) itineraryId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Body() dto: UpdateItineraryDestinationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itineraryDestinations.update(
      itineraryId,
      entryId,
      request.user.sub,
      dto,
    );
  }

  @Delete(':entryId')
  @HttpCode(204)
  remove(
    @Param('id', ParseIntPipe) itineraryId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.itineraryDestinations.remove(
      itineraryId,
      entryId,
      request.user.sub,
    );
  }
}
