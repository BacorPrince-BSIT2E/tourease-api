import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accommodation } from '../entities/accommodation.entity';
import { Destination } from '../entities/destination.entity';
import { ItineraryDestination } from '../entities/itinerary-destination.entity';
import { TourGuide } from '../entities/tour-guide.entity';
import { DestinationsController } from './destinations.controller';
import { DestinationsRepository } from './destinations.repository';
import { DestinationsService } from './destinations.service';

// Registers destination persistence, business logic, and HTTP endpoints.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Destination,
      TourGuide,
      Accommodation,
      ItineraryDestination,
    ]),
  ],
  controllers: [DestinationsController],
  providers: [DestinationsRepository, DestinationsService],
})
export class DestinationsModule {}
