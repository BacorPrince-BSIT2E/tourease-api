import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from '../entities/destination.entity';
import { ItineraryDestination } from '../entities/itinerary-destination.entity';
import { Itinerary } from '../entities/itinerary.entity';
import { ItinerariesController } from './itineraries.controller';
import { ItineraryDestinationsController } from './itinerary-destinations.controller';
import { ItineraryDestinationsRepository } from './itinerary-destinations.repository';
import { ItineraryDestinationsService } from './itinerary-destinations.service';
import { ItinerariesRepository } from './itineraries.repository';
import { ItinerariesService } from './itineraries.service';

// Registers itinerary and nested stop persistence, services, and controllers.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Itinerary,
      ItineraryDestination,
      Destination,
    ]),
  ],
  controllers: [ItinerariesController, ItineraryDestinationsController],
  providers: [
    ItinerariesRepository,
    ItinerariesService,
    ItineraryDestinationsRepository,
    ItineraryDestinationsService,
  ],
})
export class ItinerariesModule {}
